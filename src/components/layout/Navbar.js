"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Menu, X, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Image from "next/image";
import api from "@/lib/api";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  
  const pathname = usePathname();
  const router = useRouter();

  const saveAccountToLocal = (session) => {
    try {
      const stored = localStorage.getItem("elevara_accounts");
      let accs = stored ? JSON.parse(stored) : [];
      accs = accs.filter(a => a.user.id !== session.user.id);
      accs.push({ user: session.user, session: { access_token: session.access_token, refresh_token: session.refresh_token } });
      localStorage.setItem("elevara_accounts", JSON.stringify(accs));
    } catch (err) {
      console.error("Could not save account", err);
    }
  };

  const loadAccounts = () => {
    try {
      const stored = localStorage.getItem("elevara_accounts");
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Could not load accounts", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    
    const fetchProfile = async (userId) => {
      try {
        const { data } = await api.get('/users/me');
        const avatarUrl = data?.profile?.avatarUrl || null;
        if (avatarUrl) setProfile({ avatarUrl });
      } catch (err) {}
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        saveAccountToLocal(session);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    };

    getSession();
    loadAccounts();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        saveAccountToLocal(session);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAccountsOpen(false);
    router.push("/login");
  };

  const switchAccount = async (acc) => {
    if (!acc.session?.access_token) return;
    try {
      await supabase.auth.setSession({
        access_token: acc.session.access_token,
        refresh_token: acc.session.refresh_token
      });
      setUser(acc.user);
      setAccountsOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Switch account error", err);
    }
  };

  const addAccount = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setAccountsOpen(false);
    router.push("/login");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resume Analysis", path: "/dashboard/analyze" },
    { name: "Resume Studio", path: "/dashboard/studio" },
    { name: "Interviews", path: "/dashboard/tools/mock-interview" },
  ];

  return (
    <nav className="bg-(--canvas)/85 backdrop-blur-xl border-b border-(--hairline) sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-(--primary) text-white flex items-center justify-center font-serif text-lg group-hover:scale-105 transition-transform">
                E
              </div>
              <span className="font-serif text-2xl text-(--ink) tracking-tight">
                Elevara
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  pathname === link.path 
                    ? "bg-(--surface-soft) text-(--ink)" 
                    : "text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft)"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-4 w-px bg-(--hairline) mx-2" />

            <ThemeToggle />

            {user ? (
              <div className="relative ml-2">
                <button 
                  onClick={() => setAccountsOpen(!accountsOpen)}
                  className="flex items-center justify-center rounded-full overflow-hidden w-9 h-9 border border-(--hairline) hover:border-(--primary) transition-all cursor-pointer"
                  title={user.email}
                >
                  {profile?.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                  )}
                </button>

                {accountsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-(--hairline-soft) bg-(--surface-soft)">
                      <p className="text-xs font-medium text-(--muted)">Accounts</p>
                    </div>
                    <ul className="max-h-64 overflow-y-auto">
                      {accounts.map((acc) => (
                        <li key={acc.user.id}>
                          <button
                            onClick={() => switchAccount(acc)}
                            className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                              acc.user.id === user.id 
                                ? 'bg-(--surface-soft) text-(--ink) font-medium border-l-2 border-(--primary)' 
                                : 'text-(--body) hover:bg-(--surface-soft)'
                            }`}
                          >
                            <span className="truncate block">{acc.user.email}</span>
                            {acc.user.id === user.id && <span className="text-[10px] text-(--muted-soft)">(Active)</span>}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-(--hairline-soft)">
                      <button 
                        onClick={addAccount}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-(--body) hover:bg-(--surface-soft) transition-colors text-left"
                      >
                        <Plus className="w-3.5 h-3.5 text-(--muted)" /> Add Account
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-(--error) hover:bg-red-500/10 transition-colors text-left border-t border-(--hairline-soft)"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="ml-2">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl border border-(--hairline) bg-(--surface-soft) text-(--ink) hover:bg-(--surface-card) transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-(--hairline) bg-(--canvas)/95 backdrop-blur-xl p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.path 
                  ? "bg-(--surface-soft) text-(--ink)" 
                  : "text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft)"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!user && (
            <Link href="/login" className="block pt-2">
              <Button variant="default" className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
