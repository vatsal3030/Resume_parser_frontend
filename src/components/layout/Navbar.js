"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Menu, X, LogOut, UserCircle, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const saveAccountToLocal = (session) => {
    try {
      const stored = localStorage.getItem("brutal_accounts");
      let accs = stored ? JSON.parse(stored) : [];
      // Remove if exists to update
      accs = accs.filter(a => a.user.id !== session.user.id);
      accs.push({ user: session.user, session: { access_token: session.access_token, refresh_token: session.refresh_token } });
      localStorage.setItem("brutal_accounts", JSON.stringify(accs));
    } catch (err) {
      console.error("Could not save account", err);
    }
  };

  const loadAccounts = () => {
    try {
      const stored = localStorage.getItem("brutal_accounts");
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Could not load accounts", err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    
    const fetchProfile = async (userId) => {
      try {
        const { data } = await supabase.from('profiles').select('avatarUrl').eq('id', userId).single();
        if (data) setProfile(data);
      } catch (err) {}
    };

    // Check auth state
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
      loadAccounts();
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        saveAccountToLocal(session);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      loadAccounts();
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const switchAccount = async (account) => {
    setAccountsOpen(false);
    toast.info("Switching Account", `Switching to ${account.user.email}`);
    
    const { error } = await supabase.auth.setSession({
      access_token: account.session.access_token,
      refresh_token: account.session.refresh_token,
    });
    
    if (error) {
      toast.error("Failed to switch account", error.message);
      // Remove invalid session
      const newAccs = accounts.filter(a => a.user.id !== account.user.id);
      setAccounts(newAccs);
      localStorage.setItem("brutal_accounts", JSON.stringify(newAccs));
    } else {
      window.location.reload();
    }
  };

  const addAccount = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleLogout = async () => {
    if (user) {
      // remove current user from local storage
      const newAccs = accounts.filter(a => a.user.id !== user.id);
      localStorage.setItem("brutal_accounts", JSON.stringify(newAccs));
      setAccounts(newAccs);
    }
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navLinks = [
    { name: "Home", path: "/dashboard" },
    { name: "Resume Parsing", path: "/dashboard/tools/tailor" }, // Example main tools
    { name: "Cover Letter", path: "/dashboard/tools/cover-letter" },
    { name: "Mock Interview", path: "/dashboard/tools/mock-interview" },
  ];

  return (
    <nav className="bg-brutal-bg border-b-4 border-brutal-black sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black uppercase tracking-tighter bg-brutal-mint px-2 py-1 border-2 border-brutal-black text-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Elevara
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-3 py-2 text-sm font-bold uppercase tracking-wider border-2 transition-all ${
                  pathname === link.path 
                    ? "bg-brutal-yellow border-brutal-black text-black shadow-brutal-sm translate-x-0.5 translate-y-0.5" 
                    : "border-transparent text-foreground hover:bg-brutal-bg hover:border-brutal-black hover:shadow-brutal-sm"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-8 w-1 bg-brutal-black mx-2"></div>

            {user ? (
              <div className="relative ml-3">
                <button 
                  onClick={() => setAccountsOpen(!accountsOpen)}
                  className="flex items-center justify-center bg-white border-2 border-brutal-black font-bold shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all rounded-full overflow-hidden w-12 h-12"
                  title={user.email}
                >
                  {profile?.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                  )}
                </button>

                {accountsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border-4 border-brutal-black shadow-brutal-lg z-50">
                    <div className="p-3 border-b-2 border-brutal-black bg-brutal-yellow text-black font-black uppercase text-sm">
                      Accounts
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
                        onClick={addAccount}
                        className="w-full flex items-center gap-2 px-4 py-3 font-bold text-foreground hover:bg-brutal-blue hover:text-black transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Account
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="default" className="font-bold border-2 shadow-brutal-sm ml-2">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-4">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 border-2 border-brutal-black bg-brutal-yellow text-black shadow-brutal-sm hover:bg-brutal-pink focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t-4 border-brutal-black bg-brutal-bg absolute w-full left-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 text-base font-bold uppercase tracking-wider border-2 mb-2 ${
                  pathname === link.path 
                    ? "bg-brutal-yellow border-brutal-black text-black shadow-brutal-sm" 
                    : "border-transparent text-foreground hover:bg-brutal-blue hover:text-black hover:border-brutal-black"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {user ? (
            <div className="pt-4 pb-3 border-t-4 border-brutal-black">
              <div className="flex items-center px-5 mb-3">
                {profile?.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full object-cover w-10 h-10 border-2 border-brutal-black bg-white" unoptimized />
                ) : (
                  <Image src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`} alt="Avatar" width={40} height={40} className="rounded-full object-cover w-10 h-10 border-2 border-brutal-black bg-white" unoptimized />
                )}
                <div className="ml-3">
                  <div className="text-base font-bold leading-none text-foreground">{user.user_metadata?.full_name || 'User'}</div>
                  <div className="text-sm font-medium leading-none text-foreground mt-1 opacity-70">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => { setAccountsOpen(!accountsOpen); }}
                  className="flex w-full items-center justify-between px-3 py-3 font-bold text-foreground bg-brutal-mint border-2 border-brutal-black hover:bg-brutal-yellow mb-2"
                >
                  Switch Account <ChevronDown className={`w-5 h-5 transition-transform ${accountsOpen ? 'rotate-180' : ''}`}/>
                </button>
                
                {accountsOpen && (
                  <div className="ml-4 pl-4 border-l-4 border-brutal-black mb-4 space-y-2">
                    {accounts.map(acc => (
                      <button
                        key={acc.user.id}
                        onClick={() => switchAccount(acc)}
                        className={`block w-full text-left px-3 py-2 font-bold ${acc.user.id === user.id ? 'text-brutal-blue' : 'text-foreground'}`}
                      >
                        {acc.user.email} {acc.user.id === user.id && '(Active)'}
                      </button>
                    ))}
                    <button onClick={addAccount} className="block w-full text-left px-3 py-2 font-bold text-foreground hover:text-brutal-blue">
                      + Add Account
                    </button>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-3 font-bold text-white bg-red-500 border-2 border-brutal-black hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t-4 border-brutal-black px-5">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full justify-center">Login</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
