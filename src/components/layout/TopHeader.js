"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Search, Bell, UserCircle, ChevronDown, Plus, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import api from "@/lib/api";

import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { CreditBalance } from "@/components/ui/CreditBalance";

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
      const stored = localStorage.getItem("brutal_accounts");
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
      <header className="h-20 bg-brutal-bg border-b-4 border-brutal-black sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 border-2 border-brutal-black bg-brutal-yellow text-black shadow-[2px_2px_0_#000] hover:bg-brutal-pink transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className="hidden lg:flex p-2 border-2 border-brutal-black bg-brutal-yellow text-black shadow-[2px_2px_0_#000] hover:bg-brutal-pink hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => setCommandPaletteOpen(true)} className="hidden sm:flex items-center gap-2 bg-white border-2 border-brutal-black px-4 py-2 shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all w-64 text-left text-gray-500 font-bold">
            <Search className="w-4 h-4" />
            <span className="flex-1">Search...</span>
            <kbd className="hidden md:inline-block bg-brutal-bg border-2 border-brutal-black px-1.5 py-0.5 text-xs font-black text-black">Ctrl K</kbd>
          </button>
        </div>

        <CommandPalette isOpen={commandPaletteOpen} setIsOpen={setCommandPaletteOpen} />

        <div className="flex items-center gap-3 md:gap-5">
          {/* Live Credit Balance in Header */}
          <CreditBalance />

          <NotificationDropdown />

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setAccountsOpen(!accountsOpen)}
                className="flex items-center justify-center bg-white border-2 border-brutal-black font-bold shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all overflow-hidden w-12 h-12"
                title={user.email}
              >
                {profile?.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt="Avatar" width={48} height={48} className="w-full h-full object-cover p-0.5" unoptimized />
                ) : (
                  <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`} alt="Avatar" width={48} height={48} className="w-full h-full object-cover p-0.5" unoptimized />
                )}
              </button>

              {accountsOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border-4 border-brutal-black shadow-brutal-lg z-50">
                  <div className="p-3 border-b-2 border-brutal-black bg-brutal-yellow text-black font-black uppercase text-sm">
                    Switch Accounts
                  </div>
                  <ul className="max-h-64 overflow-y-auto">
                    {accounts.map((acc) => (
                      <li key={acc.user.id}>
                        <button
                          onClick={() => switchAccount(acc)}
                          className={`w-full text-left px-4 py-3 font-bold hover:bg-brutal-pink hover:text-black transition-colors ${acc.user.id === user.id ? 'bg-brutal-mint text-black border-l-4 border-brutal-black' : 'text-foreground'}`}
                        >
                          {acc.user.email}
                          {acc.user.id === user.id && <span className="ml-2 text-xs opacity-70">(Active)</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t-2 border-brutal-black">
                    <button 
                      onClick={handleAddAccount}
                      className="w-full flex items-center gap-2 px-4 py-3 font-bold hover:bg-brutal-yellow hover:text-black transition-colors text-left"
                    >
                      <Plus className="w-4 h-4" /> Add Account
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 font-bold text-red-600 hover:bg-red-500 hover:text-white transition-colors text-left border-t-2 border-brutal-black"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="default" className="font-bold border-2 shadow-brutal-sm" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Avatar Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_#000] w-full max-w-lg">
            <div className="p-4 border-b-4 border-brutal-black bg-brutal-mint flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Choose Your Identity</h2>
                <p className="text-xs font-bold text-black/80">Pick a fun avatar to get started!</p>
              </div>
              <button 
                onClick={handleSkip}
                className="w-8 h-8 bg-white border-2 border-black font-black text-sm flex items-center justify-center shadow-[2px_2px_0_#000] hover:bg-brutal-pink transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {allAvatars.map((url, index) => {
                  const isSelected = selectedAvatar === url || (!selectedAvatar && index === 0);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative w-full aspect-square border-4 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-brutal-black bg-brutal-yellow shadow-[4px_4px_0_#000] scale-105 ring-2 ring-black' 
                          : 'border-brutal-black/30 bg-brutal-bg hover:border-brutal-black hover:shadow-brutal-sm'
                      }`}
                    >
                      <Image src={url} alt={`Avatar ${index}`} fill className="p-2 object-cover" unoptimized />
                      {user?.user_metadata?.avatar_url === url && (
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black text-white px-1 font-black">Google</span>
                      )}
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-brutal-green text-black border border-black font-black text-[10px] flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <Button variant="white" className="flex-1 font-black border-3 shadow-[2px_2px_0_#000]" onClick={handleSkip}>
                  Skip for Now
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 bg-brutal-blue text-white font-black border-3 shadow-[2px_2px_0_#000] hover:bg-black" 
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
