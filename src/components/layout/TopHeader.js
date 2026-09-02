"use client";

import { useState, useEffect } from"react";
import { useRouter } from"next/navigation";
import { supabase } from"@/lib/supabase";
import { Search, Bell, UserCircle, ChevronDown, Plus, LogOut, Menu } from"lucide-react";
import { Button } from"@/components/ui/button";
import Image from"next/image";
import api from"@/lib/api";

import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { CreditBalance } from "@/components/ui/CreditBalance";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function TopHeader({ setIsMobileOpen, isDesktopCollapsed, setIsDesktopCollapsed }) {
 const [user, setUser] = useState(null);
 const [profile, setProfile] = useState(null);
 const [accountsOpen, setAccountsOpen] = useState(false);
 const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
 const [accounts, setAccounts] = useState([]);
 const [showOnboarding, setShowOnboarding] = useState(false);
 const [selectedAvatar, setSelectedAvatar] = useState(null);
 const [savingAvatar, setSavingAvatar] = useState(false);
 
 const [avatarOptions, setAvatarOptions] = useState([]);

 const router = useRouter();

 const loadAccounts = () => {
 try {
 const stored = localStorage.getItem("elevara_accounts");
 if (stored) {
 setAccounts(JSON.parse(stored));
 }
 } catch (err) {}
 };

 const fetchProfile = async (sessionUser) => {
 if (!sessionUser?.id) return;
 try {
 const userId = sessionUser.id;
 const isDismissed = typeof window !== 'undefined' && localStorage.getItem(`avatar_dismissed_${userId}`);
 
 const { data } = await api.get('/users/me');
 const avatarUrl = data?.profile?.avatarUrl || null;
 
 if (avatarUrl) {
 setProfile({ avatarUrl });
 setShowOnboarding(false);
 return;
 }

 // Check if user has a Google avatar in auth metadata
 const googleAvatar = sessionUser.user_metadata?.avatar_url || null;
 if (googleAvatar) {
 setProfile({ avatarUrl: googleAvatar });
 setShowOnboarding(false);
 if (typeof window !== 'undefined') {
 localStorage.setItem(`avatar_dismissed_${userId}`, 'true');
 }
 api.put('/users/profile', { avatarUrl: googleAvatar }).catch(() => {});
 return;
 }

 // If user hasn't set avatar and hasn't dismissed the prompt
 if (!isDismissed) {
 const generatedOptions = Array.from({ length: 6 }).map(
 () => `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.random().toString(36).substring(7)}`
 );
 setAvatarOptions(generatedOptions);
 setSelectedAvatar(generatedOptions[0]);
 setShowOnboarding(true);
 } else {
 // Use deterministic bottts avatar if dismissed previously
 setProfile({ avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userId}` });
 }
 } catch (e) {
 console.warn('Could not fetch user profile:', e?.message);
 }
 };

 useEffect(() => {
 let isMounted = true;

 const getSession = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user && isMounted) {
 setUser(session.user);
 loadAccounts();
 fetchProfile(session.user);
 }
 };
 getSession();

 const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 if (session?.user && isMounted) {
 setUser(session.user);
 loadAccounts();
 fetchProfile(session.user);
 } else if (!session && isMounted) {
 setUser(null);
 setProfile(null);
 setShowOnboarding(false);
 }
 });

 const handleAvatarSync = (e) => {
 if (e.detail) {
 setProfile((prev) => ({ ...(prev || {}), avatarUrl: e.detail }));
 }
 };
 window.addEventListener('profileAvatarUpdated', handleAvatarSync);

 return () => {
 isMounted = false;
 subscription.unsubscribe();
 window.removeEventListener('profileAvatarUpdated', handleAvatarSync);
 };
 }, []);

 const handleLogout = async () => {
 await supabase.auth.signOut();
 router.push("/login");
 };

 const handleAddAccount = async () => {
 try {
 const { data: { session } } = await supabase.auth.getSession();
 if (session?.user) {
 const savedAccounts = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
 const existing = savedAccounts.find(a => a.id === session.user.id);
 if (!existing) {
 savedAccounts.push({
 id: session.user.id,
 email: session.user.email,
 avatarUrl: profile?.avatarUrl || null,
 name: profile?.fullName || profile?.username || session.user.email?.split('@')[0],
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

 const switchAccount = async (acc) => {
 if (!acc?.user?.id || acc.user.id === user?.id) return;
 if (acc.session?.access_token && acc.session?.refresh_token) {
 await supabase.auth.setSession({ 
 access_token: acc.session.access_token, 
 refresh_token: acc.session.refresh_token 
 });
 setAccountsOpen(false);
 window.location.reload();
 } else {
 setAccountsOpen(false);
 router.push('/login');
 }
 };

 const handleSaveAvatar = async () => {
 const avatarToSave = selectedAvatar || allAvatars[0];
 if (!avatarToSave) return;
 
 setSavingAvatar(true);
 // Optimistic UI update & immediate modal dismiss
 setProfile((prev) => ({ ...(prev || {}), avatarUrl: avatarToSave }));
 setShowOnboarding(false);
 
 if (user?.id) {
 localStorage.setItem(`avatar_dismissed_${user.id}`, 'true');
 }
 window.dispatchEvent(new CustomEvent('profileAvatarUpdated', { detail: avatarToSave }));

 try {
 await api.put('/users/profile', { avatarUrl: avatarToSave });
 } catch (e) {
 console.error('Failed to save avatar to backend:', e);
 } finally {
 setSavingAvatar(false);
 }
 };

 const handleSkip = async () => {
 const fallbackAvatar = user?.user_metadata?.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user?.id || 'default'}`;
 setProfile((prev) => ({ ...(prev || {}), avatarUrl: fallbackAvatar }));
 setShowOnboarding(false);
 
 if (user?.id) {
 localStorage.setItem(`avatar_dismissed_${user.id}`, 'true');
 }
 window.dispatchEvent(new CustomEvent('profileAvatarUpdated', { detail: fallbackAvatar }));

 try {
 await api.put('/users/profile', { avatarUrl: fallbackAvatar });
 } catch (e) {}
 };

 // If user has a Google avatar, add it to options
 const allAvatars = user?.user_metadata?.avatar_url 
 ? [user.user_metadata.avatar_url, ...avatarOptions] 
 : avatarOptions;

 return (
 <>
      <header className="h-16 bg-(--canvas)/80 backdrop-blur-xl border-b border-(--hairline) sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileOpen(true)} 
            className="lg:hidden p-2 rounded-xl text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} 
            className="hidden lg:flex p-2 rounded-xl text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCommandPaletteOpen(true)} 
            className="hidden sm:flex items-center gap-2 bg-(--surface-soft) border border-(--hairline) rounded-xl px-3.5 py-2 hover:bg-(--surface-card) hover:border-(--muted-soft) transition-all w-60 text-left text-(--muted-soft) text-sm shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1">Search...</span>
            <kbd className="hidden md:inline-block bg-(--surface-card) border border-(--hairline) px-1.5 py-0.5 text-[11px] text-(--muted) rounded-md">⌘K</kbd>
          </button>
        </div>

        <CommandPalette isOpen={commandPaletteOpen} setIsOpen={setCommandPaletteOpen} />

        <div className="flex items-center gap-2 md:gap-3">
          <CreditBalance />
          <NotificationDropdown />
          <ThemeToggle />

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setAccountsOpen(!accountsOpen)}
                className="flex items-center justify-center rounded-full overflow-hidden w-9 h-9 border border-(--hairline) hover:border-(--primary) hover:shadow-md transition-all cursor-pointer"
                title={user.email}
              >
                {profile?.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                )}
              </button>

              {accountsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-xl z-50 overflow-hidden backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-(--hairline-soft) bg-(--surface-soft)">
                    <p className="text-xs font-medium text-(--muted)">Switch Accounts</p>
                  </div>
 
 <ul className="max-h-64 overflow-y-auto">
 {accounts.map((acc) => (
 <li key={acc.user.id}>
 <button
 onClick={() => switchAccount(acc)}
 className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
 acc.user.id === user.id 
 ? 'bg-(--surface-card) text-(--ink) border-l-[3px] border-l-(--primary) font-medium' 
 : 'text-(--body) hover:bg-(--surface-soft)'
 }`}
 >
 {acc.user.email}
 {acc.user.id === user.id && <span className="ml-2 text-xs text-(--muted-soft)">(Active)</span>}
 </button>
 </li>
 ))}
 </ul>
 <div className="border-t border-(--hairline-soft)">
 <button 
 onClick={handleAddAccount}
 className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-(--body) hover:bg-(--surface-soft) transition-colors text-left"
 >
 <Plus className="w-4 h-4 text-(--muted)" /> Add Account
 </button>
 <button 
 onClick={handleLogout}
 className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-(--error) hover:bg-red-50 transition-colors text-left border-t border-(--hairline-soft)"
 >
 <LogOut className="w-4 h-4" /> Sign Out
 </button>
 </div>
 </div>
 )}
 </div>
 ) : (
 <Button variant="default" onClick={() => router.push('/login')}>
 Login
 </Button>
 )}
 </div>
 </header>

 {/* Avatar Onboarding Modal — Editorial Design */}
 {showOnboarding && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
 <div className="bg-white rounded-2xl border border-(--hairline) shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
 <div className="p-5 border-b border-(--hairline-soft) flex items-center justify-between">
 <div>
 <h2 className="text-xl font-serif text-(--ink)">Choose Your Avatar</h2>
 <p className="text-sm text-(--muted) mt-0.5">Pick one to personalize your profile</p>
 </div>
 <button 
 onClick={handleSkip}
 className="w-8 h-8 rounded-full flex items-center justify-center text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors"
 title="Close"
 >
 ✕
 </button>
 </div>
 <div className="p-5 space-y-5">
 <div className="grid grid-cols-3 gap-3">
 {allAvatars.map((url, index) => {
 const isSelected = selectedAvatar === url || (!selectedAvatar && index === 0);
 return (
 <button
 key={index}
 type="button"
 onClick={() => setSelectedAvatar(url)}
 className={`relative w-full aspect-square rounded-xl transition-all cursor-pointer ${
 isSelected 
 ? 'border border-(--primary) bg-(--surface-card) shadow-md scale-[1.03] ring-2 ring-(--primary)/20' 
 : 'border border-(--hairline) bg-white hover:border-(--muted-soft) hover:shadow-sm'
 }`}
 >
 <Image src={url} alt={`Avatar ${index}`} fill className="p-2 object-cover rounded-xl" unoptimized />
 {user?.user_metadata?.avatar_url === url && (
 <span className="absolute bottom-1 right-1 text-[9px] bg-(--surface-dark) text-white px-1.5 py-0.5 rounded-full font-medium">Google</span>
 )}
 {isSelected && (
 <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-(--primary) text-white rounded-full text-[10px] flex items-center justify-center shadow-sm">
 ✓
 </span>
 )}
 </button>
 );
 })}
 </div>
 <div className="flex gap-3">
 <Button variant="secondary" className="flex-1" onClick={handleSkip}>
 Skip for Now
 </Button>
 <Button 
 variant="default" 
 className="flex-1" 
 disabled={savingAvatar} 
 onClick={handleSaveAvatar}
 >
 {savingAvatar ? 'Saving...' : 'Looks Good!'}
 </Button>
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 );
}
