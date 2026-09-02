"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, User, Briefcase, GraduationCap, Link2, Award, Loader2, Settings, Image as ImageIcon, Eye, EyeOff, Search, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/PageShell";
import { BrutalTabs } from "@/components/ui/BrutalTabs";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { COUNTRIES, getStatesForCountry, DEGREES, STATUS_OPTIONS, searchUniversities } from "@/lib/geodata";
import { Select as CustomSelect } from "@/components/ui/Select";

// --- Reusable Form Components ---

const Input = ({ label, value, field, placeholder, onChange, error, type = "text" }) => (
  <div>
    <label className="block text-xs font-medium text-(--muted) mb-1.5">{label}</label>
    <input
      className={`w-full rounded-xl border ${error ? 'border-red-500 bg-red-500/5' : 'border-(--hairline)'} bg-(--surface-soft) p-2.5 text-xs text-(--ink) placeholder:text-(--muted-soft) focus:border-(--primary) outline-none transition-colors shadow-xs`}
      value={value || ""} onChange={e => onChange(field, e.target.value)} placeholder={placeholder} type={type}
    />
    {error && <p className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const Select = ({ label, value, field, options, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-(--muted) mb-1.5">{label}</label>
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
      <label className="block text-xs font-medium text-(--muted) mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} placeholder={placeholder}
          className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) placeholder:text-(--muted-soft) focus:border-(--primary) outline-none pr-11 shadow-xs"
          value={value} onChange={onChange}
        />
        <button
          type="button" tabIndex={-1}
          onClick={() => setShow(p => !p)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-(--muted) hover:text-(--ink) transition-colors"
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

  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value || "");
  }

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
      <label className="block text-xs font-medium text-(--muted) mb-1.5">School / University</label>
      <div className="relative">
        <input
          className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) placeholder:text-(--muted-soft) focus:border-(--primary) outline-none pr-10 shadow-xs"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(field, e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Start typing to search universities..."
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-(--muted)" /> : <Search className="w-3.5 h-3.5 text-(--muted)" />}
        </div>
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 rounded-xl bg-(--surface-card) border border-(--hairline) shadow-md max-h-48 overflow-y-auto p-1">
          {results.map((uni, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-xs font-medium text-(--ink) hover:bg-(--surface-soft) rounded-lg transition-colors"
              onClick={() => {
                setQuery(uni.name);
                onChange(field, uni.name);
                setIsOpen(false);
              }}
            >
              <div className="truncate">{uni.name}</div>
              {uni.country && <div className="text-[10px] text-(--muted)">{uni.country}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function validateProfile(profile) {
  const errors = {};
  if (profile.passingYear) {
    const num = parseInt(profile.passingYear, 10);
    if (isNaN(num) || !/^\d{4}$/.test(profile.passingYear) || num < 1950 || num > 2040) {
      errors.passingYear = "Passing year must be a 4-digit year";
    }
  }
  if (profile.graduationYear) {
    const num = parseInt(profile.graduationYear, 10);
    if (isNaN(num) || !/^\d{4}$/.test(profile.graduationYear) || num < 1950 || num > 2040) {
      errors.graduationYear = "Graduation year must be a 4-digit year";
    }
  }
  return errors;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);
  const toast = useToast();

  const avatarOptions = [
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Felix",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Luna",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Shadow",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Sparky",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Nova",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Coco",
  ];

  const handleAddAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let savedAccounts = [];
        try {
          savedAccounts = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
        } catch {
          savedAccounts = [];
        }
        const currentUserId = session.user.id;
        const exists = savedAccounts.some(acc => acc.id === currentUserId);
        if (!exists) {
          savedAccounts.push({
            id: currentUserId,
            email: session.user.email,
            name: profile.name || profile.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: profile.avatarUrl || session.user.user_metadata?.avatar_url || null,
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
    const errors = validateProfile(profile);

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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid File", "Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File Too Large", "Profile picture must be under 2MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.avatarUrl) {
        update('avatarUrl', res.data.avatarUrl);
        toast.success("Avatar Updated", "Your profile picture has been updated.");
      }
    } catch (e) {
      toast.error("Upload Failed", e.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const availableStates = getStatesForCountry(profile.country);

  const tabs = [
    { id: 0, label: "Account", icon: Settings },
    { id: 1, label: "Personal", icon: User },
    { id: 2, label: "Career", icon: Briefcase },
    { id: 3, label: "Education", icon: GraduationCap },
    { id: 4, label: "Links", icon: Link2 },
    { id: 5, label: "Achievements", icon: Award },
  ];

  if (loading) {
    return (
      <PageShell title="Profile" subtitle="Manage your career identity"
        actions={
          <div className="h-9 w-28 bg-(--surface-card) border border-(--hairline) rounded-xl animate-pulse" />
        }>
        <div className="animate-pulse space-y-6">
          <div className="flex flex-wrap gap-2 pb-2">
            {['Account', 'Personal', 'Career', 'Education', 'Links', 'Achievements'].map((label, i) => (
              <div key={i} className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium ${i === 0 ? 'bg-(--primary) text-white border-(--primary)' : 'bg-(--surface-card) border-(--hairline) text-(--muted)'}`}>
                {label}
              </div>
            ))}
          </div>

          <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 md:p-8 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="h-4 bg-(--surface-soft) rounded-lg w-28 mb-4" />
                <div className="flex items-center gap-6 mt-4">
                  <div className="w-20 h-20 rounded-2xl bg-(--surface-soft) border border-(--hairline-soft) shrink-0" />
                  <div className="space-y-2">
                    <div className="h-8 bg-(--surface-soft) border border-(--hairline-soft) rounded-xl w-28" />
                    <div className="h-3 bg-(--surface-soft) rounded w-24" />
                  </div>
                </div>
              </div>

              <div>
                <div className="h-4 bg-(--surface-soft) rounded-lg w-24 mb-4" />
                <div className="space-y-4 mt-4">
                  <div>
                    <div className="h-3 bg-(--surface-soft) rounded w-24 mb-2" />
                    <div className="h-9 bg-(--surface-soft) border border-(--hairline-soft) rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Profile" subtitle="Manage your career identity"
      actions={
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="text-xs px-4"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      }>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-6" />}

      <BrutalTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6 bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Account Tab */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-base font-serif font-medium text-(--ink) mb-4 border-b border-(--hairline-soft) pb-2">Profile Picture</h3>
              <div className="flex items-center gap-5 mt-4">
                <div className="w-20 h-20 rounded-2xl bg-(--surface-soft) border border-(--hairline) shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Avatar" width={80} height={80} unoptimized className="w-full h-full object-cover" />
                  ) : (
                    <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.id || 'default'}`} alt="Default Avatar" width={80} height={80} unoptimized className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
                  <Button variant="secondary" className="text-xs px-3" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                    {avatarUploading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5 mr-1.5" />}
                    {avatarUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <p className="text-[11px] text-(--muted) mt-1.5">Recommended: 256x256px</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-medium text-(--muted) mb-2.5">Or pick an avatar</p>
                <div className="flex gap-2 flex-wrap">
                  {avatarOptions.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => update("avatarUrl", url)}
                      className={`w-11 h-11 rounded-xl border transition-all ${profile.avatarUrl === url ? 'border-(--primary) bg-(--primary)/10 scale-105 shadow-xs' : 'border-(--hairline) bg-(--surface-soft) hover:border-(--primary)/50'}`}
                    >
                      <Image src={url} alt="Option" width={44} height={44} className="w-full h-full object-cover p-1" unoptimized />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-serif font-medium text-(--ink) mb-4 border-b border-(--hairline-soft) pb-2">Security</h3>
              <div className="space-y-4 mt-4">
                <PasswordField label="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
                {validationErrors.newPassword && (
                  <p className="text-[11px] font-medium text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{validationErrors.newPassword}</p>
                )}
                <PasswordField label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
                {validationErrors.confirmPassword && (
                  <p className="text-[11px] font-medium text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{validationErrors.confirmPassword}</p>
                )}
                <p className="text-[11px] text-(--muted)">Minimum 6 characters. Leave both fields blank to keep your current password.</p>
              </div>
            </div>

            {/* Account Management Addon */}
            <div className="md:col-span-2 border-t border-(--hairline-soft) pt-6 mt-2">
              <h3 className="text-base font-serif font-medium text-(--ink) mb-2">Account Management</h3>
              <p className="text-xs text-(--muted) mb-4 leading-relaxed">You can switch between multiple accounts from the top-right navigation menu. Click below to add a new account to your profile switcher.</p>
              <Button variant="secondary" onClick={handleAddAccount} className="text-xs flex items-center">
                <Plus className="w-4 h-4 mr-1.5" />
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
              <label className="block text-xs font-medium text-(--muted) mb-1.5">Bio</label>
              <textarea 
                className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) min-h-24 outline-none focus:border-(--primary) transition-colors resize-none shadow-xs"
                value={profile.bio || ""} onChange={e => update("bio", e.target.value)} placeholder="Tell us about yourself..." 
              />
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
              <label className="block text-xs font-medium text-(--muted) mb-1.5">Preferred Languages</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(profile.preferredLanguages || []).map((l, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-(--surface-soft) border border-(--hairline-soft) text-(--ink) flex items-center gap-1">
                    {l}
                    <button type="button" onClick={() => update("preferredLanguages", profile.preferredLanguages.filter((_, j) => j !== i))} className="hover:text-red-500 text-xs">×</button>
                  </span>
                ))}
              </div>
              <input 
                className="rounded-xl border border-(--hairline) bg-(--surface-soft) p-2 text-xs text-(--ink) w-full outline-none focus:border-(--primary) shadow-xs" 
                placeholder="Type language + Enter (e.g. JavaScript, C++)"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (e.target.value.trim()) { update("preferredLanguages", [...(profile.preferredLanguages || []), e.target.value.trim()]); e.target.value = ""; } } }} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-(--muted) mb-1.5">Skills</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(profile.skills || []).map((s, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-(--surface-soft) border border-(--hairline-soft) text-(--ink) flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => update("skills", profile.skills.filter((_, j) => j !== i))} className="hover:text-red-500 text-xs">×</button>
                  </span>
                ))}
              </div>
              <input 
                className="rounded-xl border border-(--hairline) bg-(--surface-soft) p-2 text-xs text-(--ink) w-full outline-none focus:border-(--primary) shadow-xs" 
                placeholder="Type skill + Enter"
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (e.target.value.trim()) { update("skills", [...(profile.skills || []), e.target.value.trim()]); e.target.value = ""; } } }} 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-(--muted) mb-1.5">Career Goals</label>
              <textarea 
                className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) min-h-24 outline-none focus:border-(--primary) transition-colors resize-none shadow-xs"
                value={profile.careerGoals || ""} onChange={e => update("careerGoals", e.target.value)} placeholder="Describe your career aspirations and goals..." 
              />
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <UniversitySearch value={profile.school} field="school" onChange={update} country={profile.country} />
              <p className="text-[11px] text-(--muted) mt-1">Type at least 3 characters to search worldwide universities</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "linkedin", label: "LinkedIn", icon: "🔗", placeholder: "https://linkedin.com/in/your-profile" },
              { key: "github", label: "GitHub", icon: "🐙", placeholder: "https://github.com/username" },
              { key: "twitter", label: "Twitter / X", icon: "🐦", placeholder: "https://twitter.com/handle" },
              { key: "portfolio", label: "Portfolio", icon: "🌐", placeholder: "https://yoursite.com" },
              { key: "leetcode", label: "LeetCode", icon: "⚡", placeholder: "https://leetcode.com/u/username" },
              { key: "codeforces", label: "Codeforces", icon: "🏆", placeholder: "https://codeforces.com/profile/handle" },
              { key: "geeksforgeeks", label: "GeeksforGeeks", icon: "💚", placeholder: "https://geeksforgeeks.org/user/username" },
            ].map(link => {
              const url = profile.socialLinks?.[link.key] || "";
              const hasUrl = url.trim().length > 0;
              return (
                <div key={link.key} className="rounded-xl border border-(--hairline) bg-(--surface-soft) p-3.5 transition-all shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-(--ink)">
                      <span>{link.icon}</span>
                      {link.label}
                    </label>
                    {hasUrl && (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--surface-card) border border-(--hairline-soft) text-(--primary) hover:underline flex items-center gap-1">
                        Visit ↗
                      </a>
                    )}
                  </div>
                  <input
                    className="w-full rounded-lg border border-(--hairline-soft) bg-(--surface-card) p-2 text-xs text-(--ink) outline-none focus:border-(--primary) transition-colors"
                    value={url}
                    onChange={e => updateSocial(link.key, e.target.value)}
                    placeholder={link.placeholder}
                  />
                  {hasUrl && (
                    <p className="text-[10px] font-medium text-emerald-500 mt-1 flex items-center gap-1">✓ Connected</p>
                  )}
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
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-(--hairline) bg-(--surface-soft)">
                  <Award className="w-4 h-4 text-(--primary) shrink-0" />
                  <span className="flex-1 text-xs font-medium text-(--ink)">{a}</span>
                  <button onClick={() => update("achievements", profile.achievements.filter((_, j) => j !== i))} className="text-red-500 font-bold text-xs hover:opacity-80">×</button>
                </div>
              ))}
            </div>
            <input 
              className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) outline-none focus:border-(--primary) shadow-xs" 
              placeholder="Add achievement + Enter"
              onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { update("achievements", [...(profile.achievements || []), e.target.value.trim()]); e.target.value = ""; } }} 
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
