"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Briefcase, GraduationCap, Link2, Award, Loader2, Settings, Image as ImageIcon, Eye, EyeOff, Search, ChevronDown, AlertCircle, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/PageShell";
import { BrutalTabs } from "@/components/ui/BrutalTabs";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { COUNTRIES, getStatesForCountry, DEGREES, STATUS_OPTIONS, searchUniversities } from "@/lib/geodata";

const API = process.env.NEXT_PUBLIC_API_URL;

// --- Reusable Form Components ---

const Input = ({ label, value, field, placeholder, onChange, error, type = "text" }) => (
  <div>
    <label className="block text-xs font-black uppercase mb-1">{label}</label>
    <input
      className={`w-full border-2 ${error ? 'border-red-500 bg-red-50' : 'border-brutal-black'} p-2.5 font-bold text-sm focus:bg-brutal-yellow/20 outline-none transition-colors`}
      value={value || ""} onChange={e => onChange(field, e.target.value)} placeholder={placeholder} type={type}
    />
    {error && <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

import { Select as CustomSelect } from "@/components/ui/Select";

const Select = ({ label, value, field, options, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-black uppercase mb-1">{label}</label>
    <CustomSelect
      value={value}
      onChange={val => onChange(field, val)}
      placeholder={placeholder || `Select ${label}`}
      options={options.map(opt => {
        const val = typeof opt === "string" ? opt : opt.value;
        const lbl = typeof opt === "string" ? opt : opt.label;
        return { value: val, label: lbl };
      })}
    />
  </div>
);

const PasswordField = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-black uppercase mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} placeholder={placeholder}
          className="w-full border-2 border-brutal-black p-2.5 font-bold text-sm focus:bg-brutal-pink/20 outline-none pr-12"
          value={value} onChange={onChange}
        />
        <button
          type="button" tabIndex={-1}
          onClick={() => setShow(p => !p)}
          className="absolute right-0 top-0 h-full px-3 flex items-center border-l-2 border-brutal-black bg-brutal-bg hover:bg-brutal-yellow transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// --- University Autocomplete ---
const UniversitySearch = ({ value, field, onChange, country }) => {
  const [query, setQuery] = useState(value || "");
  const [prevValue, setPrevValue] = useState(value);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Sync local query state when the parent value prop changes (React-recommended pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value || "");
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = useCallback((searchQuery) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery || searchQuery.length < 3) { setResults([]); setIsOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const unis = await searchUniversities(searchQuery, country);
      setResults(unis);
      setIsOpen(unis.length > 0);
      setLoading(false);
    }, 400);
  }, [country]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-black uppercase mb-1">School / University</label>
      <div className="relative">
        <input
          className="w-full border-2 border-brutal-black p-2.5 font-bold text-sm focus:bg-brutal-yellow/20 outline-none pr-10"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(field, e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Start typing to search universities..."
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <Search className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] max-h-48 overflow-y-auto">
          {results.map((uni, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-brutal-yellow/30 border-b border-gray-200 last:border-0 transition-colors"
              onClick={() => {
                setQuery(uni.name);
                onChange(field, uni.name);
                setIsOpen(false);
              }}
            >
              <div className="truncate">{uni.name}</div>
              {uni.country && <div className="text-xs text-gray-500 font-medium">{uni.country}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Validation ---
function validateYear(value, label) {
  if (!value) return null;
  const num = parseInt(value, 10);
  if (isNaN(num) || !/^\d{4}$/.test(value)) return `${label} must be a 4-digit year`;
  if (num < 1950 || num > 2040) return `${label} must be between 1950 and 2040`;
  return null;
}

function validateProfile(profile) {
  const errors = {};
  const passingErr = validateYear(profile.passingYear, "Passing Year");
  if (passingErr) errors.passingYear = passingErr;

  const gradErr = validateYear(profile.graduationYear, "Graduation Year");
  if (gradErr) errors.graduationYear = gradErr;

  if (profile.passingYear && profile.graduationYear) {
    const py = parseInt(profile.passingYear, 10);
    const gy = parseInt(profile.graduationYear, 10);
    if (!isNaN(py) && !isNaN(gy) && gy < py) {
      errors.graduationYear = "Graduation year cannot be before passing year";
    }
  }
  return errors;
}

// ===== Main Component =====
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [avatarOptions] = useState(() => 
    Array.from({ length: 6 }).map(() => `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.random().toString(36).substring(7)}`)
  );
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleAddAccount = async () => {
    try {
      // Save current account to localStorage for account switcher
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const savedAccounts = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
        const existing = savedAccounts.find(a => a.id === session.user.id);
        if (!existing) {
          savedAccounts.push({
            id: session.user.id,
            email: session.user.email,
            avatarUrl: profile.avatarUrl || null,
            name: profile.fullName || profile.username || session.user.email?.split('@')[0],
            savedAt: new Date().toISOString()
          });
          localStorage.setItem('saved_accounts', JSON.stringify(savedAccounts));
        }
      }
    } catch (e) {
      console.error('Failed to save account info:', e);
    }
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    api.get(`/users/me`)
      .then(res => { setProfile(res.data.profile || {}); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const update = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (field === 'avatarUrl') {
      window.dispatchEvent(new CustomEvent('profileAvatarUpdated', { detail: value }));
    }
    // Clear validation error on change
    if (validationErrors[field]) {
      setValidationErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };
  const updateSocial = (key, value) => {
    const links = { ...(profile.socialLinks || {}) };
    links[key] = value;
    update("socialLinks", links);
  };

  const handleSave = async () => {
    // Validate before saving
    const errors = validateProfile(profile);

    // Password match validation
    if (newPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (newPassword && newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Validation Error", "Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/profile`, profile);
      
      if (newPassword) {
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) throw pwError;
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Saved", "Profile & Password updated successfully");
      } else {
        toast.success("Saved", "Profile updated successfully");
      }
      setValidationErrors({});
    } catch (e) { toast.error("Error", e.message); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      update("avatarUrl", publicUrl);
      toast.success("Uploaded", "Avatar updated successfully");
    } catch (e) {
      toast.error("Upload Failed", e.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Dynamic states based on selected country
  const availableStates = getStatesForCountry(profile.country);

  const tabs = [
    { id: 0, label: "Account", icon: Settings, color: "bg-brutal-yellow" },
    { id: 1, label: "Personal", icon: User, color: "bg-brutal-pink" },
    { id: 2, label: "Career", icon: Briefcase, color: "bg-brutal-blue" },
    { id: 3, label: "Education", icon: GraduationCap, color: "bg-brutal-mint" },
    { id: 4, label: "Links", icon: Link2, color: "bg-purple-300" },
    { id: 5, label: "Achievements", icon: Award, color: "bg-orange-300" },
  ];

  if (loading) {
    return (
      <PageShell title="Profile" subtitle="Manage your career identity" subtitleColor="bg-brutal-blue text-white"
        actions={
          <div className="h-10 w-32 bg-gray-200 border-2 border-brutal-black animate-pulse" />
        }>
        <div className="animate-pulse">
          {/* Tab bar skeleton — matches BrutalTabs */}
          <div className="flex flex-wrap gap-2 border-b-4 border-brutal-black pb-3 mb-6">
            {['Account', 'Personal', 'Career', 'Education', 'Links', 'Achievements'].map((label, i) => (
              <div key={i} className={`px-4 py-2 border-2 border-brutal-black text-xs font-black uppercase ${i === 0 ? 'bg-brutal-yellow shadow-[2px_2px_0_#000]' : 'bg-gray-100'}`}>
                {label}
              </div>
            ))}
          </div>

          {/* Content card — matches "bg-white border-4 border-brutal-black p-6 shadow-brutal" */}
          <div className="bg-white border-4 border-brutal-black p-6 shadow-brutal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Profile Picture skeleton */}
              <div>
                <div className="h-6 bg-gray-300 rounded w-36 mb-4 border-b-4 border-gray-200 pb-2" />
                <div className="flex items-center gap-6 mt-4">
                  <div className="w-24 h-24 bg-gray-200 border-4 border-gray-300 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-9 bg-gray-200 border-2 border-gray-300 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-28" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-12 h-12 bg-gray-100 border-2 border-gray-200" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Security skeleton */}
              <div>
                <div className="h-6 bg-gray-300 rounded w-24 mb-4 border-b-4 border-gray-200 pb-2" />
                <div className="space-y-4 mt-4">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-28 mb-2" />
                    <div className="h-10 bg-gray-100 border-2 border-gray-200" />
                  </div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-10 bg-gray-100 border-2 border-gray-200" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-64" />
                </div>
              </div>

              {/* Bottom: Account Management skeleton */}
              <div className="md:col-span-2 border-t-4 border-gray-200 pt-6 mt-2">
                <div className="h-6 bg-gray-300 rounded w-44 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full max-w-md mb-4" />
                <div className="h-10 bg-gray-200 border-2 border-gray-300 rounded w-48" />
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Profile" subtitle="Manage your career identity" subtitleColor="bg-brutal-blue text-white"
      actions={
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className={`gap-2 px-6 py-3 text-sm font-black uppercase border-3 border-brutal-black transition-all ${
            saving 
              ? 'bg-gray-300 text-gray-500 shadow-none' 
              : 'bg-gradient-to-r from-brutal-mint to-brutal-yellow text-brutal-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1'
          }`}
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "💾 Save Profile"}
        </Button>
      }>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-6" />}

      <BrutalTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6 bg-white border-4 border-brutal-black p-6 shadow-brutal">
        {/* Account Tab */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-brutal-black pb-2 inline-block">Profile Picture</h3>
              <div className="flex items-center gap-6 mt-4">
                <div className="w-24 h-24 bg-brutal-bg border-4 border-brutal-black shadow-brutal-sm flex items-center justify-center overflow-hidden shrink-0">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Avatar" width={96} height={96} unoptimized className="w-full h-full object-cover" />
                  ) : (
                    <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.id || 'default'}`} alt="Default Avatar" width={96} height={96} unoptimized className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                    {avatarUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    {avatarUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <p className="text-xs font-bold text-gray-500 mt-2">Recommended: 256x256px</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase text-gray-500 mb-2">Or pick a fun avatar</p>
                <div className="flex gap-2 flex-wrap">
                  {avatarOptions.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => update("avatarUrl", url)}
                      className={`w-12 h-12 border-2 transition-all ${profile.avatarUrl === url ? 'border-brutal-black bg-brutal-yellow scale-110 shadow-[2px_2px_0_#000]' : 'border-transparent hover:border-brutal-black bg-brutal-bg hover:shadow-brutal-sm'}`}
                    >
                      <Image src={url} alt="Option" width={48} height={48} className="w-full h-full object-cover p-1" unoptimized />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-brutal-black pb-2 inline-block">Security</h3>
              <div className="space-y-4 mt-4">
                <PasswordField label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
                {validationErrors.newPassword && (
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{validationErrors.newPassword}</p>
                )}
                <PasswordField label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
                {validationErrors.confirmPassword && (
                  <p className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{validationErrors.confirmPassword}</p>
                )}
                <p className="text-xs font-bold text-gray-400">Minimum 6 characters. Leave both fields blank to keep your current password.</p>
              </div>
            </div>

            {/* Account Management Addon */}
            <div className="md:col-span-2 border-t-4 border-brutal-black pt-6 mt-2">
              <h3 className="text-xl font-black uppercase mb-4 border-b-4 border-brutal-black pb-2 inline-block">Account Management</h3>
              <p className="text-sm font-bold text-gray-600 mb-4">You can switch between multiple Elevara accounts instantly from the top-right navigation menu. Click below to add a new account to your profile switcher.</p>
              <Button onClick={handleAddAccount} className="bg-brutal-blue text-black border-2 border-brutal-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Another Account
              </Button>
            </div>
          </div>
        )}

        {/* Personal Tab */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Username" value={profile.username} field="username" placeholder="your-username" onChange={update} />
            <Input label="Phone" value={profile.phone} field="phone" placeholder="+1 234 567 8900" onChange={update} />
            <Select label="Country" value={profile.country} field="country" options={COUNTRIES} onChange={update} placeholder="Select Country" />
            {availableStates.length > 0 ? (
              <Select label="State / Region" value={profile.state} field="state" options={availableStates} onChange={update} placeholder="Select State" />
            ) : (
              <Input label="State / Region" value={profile.state} field="state" placeholder="Your state or region" onChange={update} />
            )}
            <Input label="City" value={profile.city} field="city" placeholder="San Francisco" onChange={update} />
            <Select label="Current Status" value={profile.currentStatus} field="currentStatus" options={STATUS_OPTIONS} onChange={update} placeholder="Select Status" />
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-1">Bio</label>
              <textarea className="w-full border-2 border-brutal-black p-2.5 font-medium text-sm min-h-[100px] focus:bg-brutal-yellow/20 outline-none resize-none"
                value={profile.bio || ""} onChange={e => update("bio", e.target.value)} placeholder="Tell us about yourself..." />
            </div>
          </div>
        )}

        {/* Career Tab */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Target Role" value={profile.targetRole} field="targetRole" placeholder="Software Engineer" onChange={update} />
            <Select label="Experience Level" value={profile.experienceLevel} field="experienceLevel"
              options={["Intern", "Entry Level", "Junior", "Mid-Level", "Senior", "Lead", "Manager", "Director", "VP", "C-Level"]}
              onChange={update} placeholder="Select Level"
            />
            <Input label="Field" value={profile.field} field="field" placeholder="Software Engineering" onChange={update} />
            <Input label="Salary Expectation" value={profile.salaryExpectation} field="salaryExpectation" placeholder="$120k - $150k" onChange={update} />
            
            <Select label="Coding Experience" value={profile.codingExperience} field="codingExperience"
              options={["Beginner", "Intermediate", "Advanced"]}
              onChange={update} placeholder="Select Coding Experience"
            />

            <div className="md:col-span-1">
              <label className="block text-xs font-black uppercase mb-1">Preferred Languages</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(profile.preferredLanguages || []).map((l, i) => (
                  <span key={i} className="text-xs font-bold px-2 py-1 bg-brutal-blue border-2 border-brutal-black flex items-center gap-1 text-black">
                    {l}
                    <button type="button" onClick={() => update("preferredLanguages", profile.preferredLanguages.filter((_, j) => j !== i))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <input className="border-2 border-brutal-black p-2 text-sm font-bold w-full focus:bg-brutal-yellow/20 outline-none" placeholder="Type language + Enter (e.g. JavaScript, C++)"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (e.target.value.trim()) { update("preferredLanguages", [...(profile.preferredLanguages || []), e.target.value.trim()]); e.target.value = ""; } } }} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-1">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(profile.skills || []).map((s, i) => (
                  <span key={i} className="text-xs font-bold px-2 py-1 bg-brutal-mint border-2 border-brutal-black flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => update("skills", profile.skills.filter((_, j) => j !== i))} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <input className="border-2 border-brutal-black p-2 text-sm font-bold w-full focus:bg-brutal-yellow/20 outline-none" placeholder="Type skill + Enter"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (e.target.value.trim()) { update("skills", [...(profile.skills || []), e.target.value.trim()]); e.target.value = ""; } } }} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase mb-1">Career Goals</label>
              <textarea className="w-full border-2 border-brutal-black p-2.5 font-medium text-sm min-h-[100px] focus:bg-brutal-yellow/20 outline-none resize-none"
                value={profile.careerGoals || ""} onChange={e => update("careerGoals", e.target.value)} placeholder="Describe your career aspirations and goals..." />
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <UniversitySearch value={profile.school} field="school" onChange={update} country={profile.country} />
              <p className="text-xs font-bold text-gray-400 mt-1">Type at least 3 characters to search worldwide universities</p>
            </div>
            <Select label="Degree" value={profile.degree} field="degree" options={DEGREES} onChange={update} placeholder="Select Degree" />
            <Input label="Branch / Major" value={profile.branch} field="branch" placeholder="Computer Science" onChange={update} />
            <Input
              label="Passing Year" value={profile.passingYear} field="passingYear" placeholder="2024" onChange={update}
              error={validationErrors.passingYear}
            />
            <Input
              label="Graduation Year" value={profile.graduationYear?.toString()} field="graduationYear" placeholder="2024" onChange={update}
              error={validationErrors.graduationYear}
            />
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: "linkedin", label: "LinkedIn", icon: "🔗", color: "bg-blue-100 border-blue-400", accent: "bg-blue-500", placeholder: "https://linkedin.com/in/your-profile" },
              { key: "github", label: "GitHub", icon: "🐙", color: "bg-gray-100 border-gray-400", accent: "bg-gray-800", placeholder: "https://github.com/username" },
              { key: "twitter", label: "Twitter / X", icon: "🐦", color: "bg-sky-50 border-sky-400", accent: "bg-sky-500", placeholder: "https://twitter.com/handle" },
              { key: "portfolio", label: "Portfolio", icon: "🌐", color: "bg-purple-50 border-purple-400", accent: "bg-purple-500", placeholder: "https://yoursite.com" },
              { key: "leetcode", label: "LeetCode", icon: "⚡", color: "bg-orange-50 border-orange-400", accent: "bg-orange-500", placeholder: "https://leetcode.com/u/username" },
              { key: "codeforces", label: "Codeforces", icon: "🏆", color: "bg-red-50 border-red-400", accent: "bg-red-500", placeholder: "https://codeforces.com/profile/handle" },
              { key: "geeksforgeeks", label: "GeeksforGeeks", icon: "💚", color: "bg-green-50 border-green-400", accent: "bg-green-600", placeholder: "https://geeksforgeeks.org/user/username" },
            ].map(link => {
              const url = profile.socialLinks?.[link.key] || "";
              const hasUrl = url.trim().length > 0;
              return (
                <div key={link.key} className={`border-2 ${link.color} p-4 transition-all hover:shadow-[2px_2px_0_#000] relative overflow-hidden`}>
                  {/* Accent strip */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${link.accent}`} />
                  <div className="pl-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <span className="text-base">{link.icon}</span>
                        {link.label}
                      </label>
                      {hasUrl && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className={`text-[10px] font-black uppercase px-2 py-1 ${link.accent} text-white border border-black hover:opacity-80 transition-opacity flex items-center gap-1`}>
                          Visit ↗
                        </a>
                      )}
                    </div>
                    <input
                      className="w-full border-2 border-brutal-black p-2.5 font-bold text-sm focus:bg-brutal-yellow/20 outline-none bg-white"
                      value={url}
                      onChange={e => updateSocial(link.key, e.target.value)}
                      placeholder={link.placeholder}
                    />
                    {hasUrl && (
                      <p className="text-[10px] font-bold text-green-600 mt-1 flex items-center gap-1">✓ Connected</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 5 && (
          <div>
            <div className="space-y-2 mb-4">
              {(profile.achievements || []).map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border-2 border-brutal-black bg-slate-50">
                  <Award className="w-4 h-4 text-brutal-yellow shrink-0" />
                  <span className="flex-1 text-sm font-bold">{a}</span>
                  <button onClick={() => update("achievements", profile.achievements.filter((_, j) => j !== i))} className="text-red-500 font-bold text-xs">×</button>
                </div>
              ))}
            </div>
            <input className="w-full border-2 border-brutal-black p-2.5 font-bold text-sm" placeholder="Add achievement + Enter"
              onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { update("achievements", [...(profile.achievements || []), e.target.value.trim()]); e.target.value = ""; } }} />
          </div>
        )}
      </div>
    </PageShell>
  );
}
