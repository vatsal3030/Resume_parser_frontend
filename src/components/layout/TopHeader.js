"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { accountManager } from "@/lib/accountManager";
import { Search, Bell, UserCircle, ChevronDown, Plus, LogOut, Menu, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import api from "@/lib/api";

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
    setAccounts(accountManager.getSavedAccounts());
  };

  const fetchProfile = async (sessionUser) => {
    if (!sessionUser?.id) return;
    try {
      const userId = sessionUser.id;
      const isDismissed = typeof window !== 'undefined' && localStorage.getItem(`avatar_dismissed_${userId}`);
      
      const { data } = await api.get('/users/me');
      const avatarUrl = data?.profile?.avatarUrl || null;
      
      if (avatarUrl) {
        setProfile({ avatarUrl, ...data?.profile, role: data?.role });
        setShowOnboarding(false);
        accountManager.saveAccount({ user: sessionUser, profile: { avatarUrl, ...data?.profile } });
        return;
      }

      // Check if user has a Google avatar in auth metadata
      const googleAvatar = sessionUser.user_metadata?.avatar_url || null;
      if (googleAvatar) {
        setProfile({ avatarUrl: googleAvatar, ...data?.profile, role: data?.role });
        setShowOnboarding(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`avatar_dismissed_${userId}`, 'true');
        }
        accountManager.saveAccount({ user: sessionUser, profile: { avatarUrl: googleAvatar, ...data?.profile } });
        return;
      }

      // If user hasn't set an avatar and hasn't dismissed the modal, show onboarding
      if (!isDismissed) {
        // Pre-generate 6 stylish unique avatars
        const generated = [
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userId}-1`,
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userId}-2`,
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userId}-3`,
          `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${userId}-4`,
          `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${userId}-5`,
          `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${userId}-6`,
        ];
        setAvatarOptions(generated);
        setShowOnboarding(true);
      } else {
        const fallbackAvatar = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userId}`;
        setProfile({ avatarUrl: fallbackAvatar, ...data?.profile, role: data?.role });
        accountManager.saveAccount({ user: sessionUser, profile: { avatarUrl: fallbackAvatar, ...data?.profile } });
      }
    } catch (e) {
      console.error('Failed to fetch profile in TopHeader:', e);
      const fallbackAvatar = sessionUser.user_metadata?.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${sessionUser.id}`;
      setProfile({ avatarUrl: fallbackAvatar });
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
        accountManager.saveAccount({ user: session.user, session });
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && isMounted) {
        setUser(session.user);
        loadAccounts();
        fetchProfile(session.user);
        accountManager.saveAccount({ user: session.user, session });
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
    window.addEventListener('elevara_accounts_changed', loadAccounts);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('profileAvatarUpdated', handleAvatarSync);
      window.removeEventListener('elevara_accounts_changed', loadAccounts);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleAddAccount = () => {
    setAccountsOpen(false);
    router.push("/login?add_account=true");
  };

  const switchAccount = async (acc) => {
    if (!acc?.id || acc.id === user?.id) return;
    const res = await accountManager.restoreSession(acc.id, supabase);
    if (res.success) {
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
    setShowOnboarding(false);
    setProfile((prev) => ({ ...(prev || {}), avatarUrl: fallbackAvatar }));
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

  const adminEmails = ['vatsalvadgama04@gmail.com', 'vatsalvadgama05@gmail.com'];
  const isAdmin = profile?.role === 'ADMIN' || (user?.email && adminEmails.includes(user.email.toLowerCase()));

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
            className="hidden sm:flex items-center gap-2 bg-(--surface-soft) border border-(--hairline) rounded-xl px-3.5 py-2 hover:bg-(--surface-card) hover:border-(--muted-soft) transition-all w-60 text-left text-(--muted-soft) text-sm shadow-xs"
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
                <div className="absolute right-0 mt-2 w-72 bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-2xl z-50 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-(--hairline-soft) bg-(--surface-soft)/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-(--ink)">{profile?.fullName || user.email?.split('@')[0]}</p>
                      <p className="text-[11px] text-(--muted) truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <span className="text-[9px] font-medium bg-(--primary)/10 text-(--primary) border border-(--primary)/20 px-1.5 py-0.5 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
 
                  <div className="px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-(--muted-soft) border-b border-(--hairline-soft)">
                    Switch Account ({accounts.length})
                  </div>

                  <ul className="max-h-56 overflow-y-auto divide-y divide-(--hairline-soft)">
                    {accounts.map((acc) => {
                      const isActive = acc.id === user.id;
                      return (
                        <li key={acc.id}>
                          <button
                            onClick={() => switchAccount(acc)}
                            className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center gap-2.5 ${
                              isActive 
                                ? 'bg-(--surface-soft) text-(--ink) font-medium' 
                                : 'text-(--body) hover:bg-(--surface-soft)/60'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-(--surface-card) border border-(--hairline) overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-serif">
                              {acc.avatarUrl ? (
                                <img src={acc.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span>{(acc.name || acc.email)?.[0]?.toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs">{acc.name || acc.email}</p>
                              <p className="text-[10px] text-(--muted) truncate">{acc.email}</p>
                            </div>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="border-t border-(--hairline-soft) bg-(--surface-soft)/30 p-1 space-y-0.5">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setAccountsOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-(--primary) hover:bg-(--surface-soft) rounded-xl transition-colors font-medium"
                      >
                        <Shield className="w-3.5 h-3.5" /> Admin Console
                      </Link>
                    )}
                    <button 
                      onClick={handleAddAccount}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-(--ink) hover:bg-(--surface-soft) rounded-xl transition-colors text-left font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 text-(--muted)" /> Add Another Account
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="default" onClick={() => router.push('/login')} className="text-xs">
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Avatar Onboarding Modal — Editorial Design */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-(--hairline-soft) flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-(--ink)">Choose Your Avatar</h2>
                <p className="text-xs text-(--muted) mt-0.5">Pick one to personalize your profile</p>
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
                          : 'border border-(--hairline) bg-(--surface-soft) hover:border-(--muted-soft) hover:shadow-sm'
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
                <Button variant="secondary" className="flex-1 text-xs" onClick={handleSkip}>
                  Skip for Now
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 text-xs" 
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
