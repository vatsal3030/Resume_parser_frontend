"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for redirect messages (e.g. from register page)
  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setTimeout(() => setSuccess(decodeURIComponent(msg)), 0);
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (authError.message.includes('Email not confirmed')) {
        setError('Your email is not confirmed yet. Check your inbox or ask admin to disable email confirmation.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (data?.session) {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });
    if (error) setError(error.message);
  };

  const [savedAccounts, setSavedAccounts] = useState([]);

  useEffect(() => {
    try {
      const accounts = JSON.parse(localStorage.getItem('saved_accounts') || '[]');
      setSavedAccounts(accounts);
    } catch { /* ignore */ }
  }, []);

  const removeSavedAccount = (accountId) => {
    const updated = savedAccounts.filter(a => a.id !== accountId);
    setSavedAccounts(updated);
    localStorage.setItem('saved_accounts', JSON.stringify(updated));
  };

  return (
    <Card>
      <CardHeader className="bg-brutal-pink">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription className="text-brutal-black">Sign in to review AI insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Saved Accounts Section */}
        {savedAccounts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-tight text-gray-500">Quick Login — Saved Accounts</p>
            {savedAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center gap-3 p-3 border-3 border-brutal-black bg-brutal-bg hover:bg-brutal-yellow/20 cursor-pointer shadow-[2px_2px_0_#000] transition-all group"
                onClick={() => {
                  setEmail(acc.email);
                  setSuccess(`Logging in as ${acc.name || acc.email}. Enter your password.`);
                }}
              >
                <div className="w-10 h-10 bg-white border-2 border-brutal-black flex items-center justify-center overflow-hidden shrink-0">
                  {acc.avatarUrl ? (
                    <img src={acc.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black">{(acc.name || acc.email)?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">{acc.name || 'User'}</p>
                  <p className="text-xs font-bold text-gray-500 truncate">{acc.email}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeSavedAccount(acc.id); }}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove saved account"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="relative flex items-center py-1">
              <div className="grow border-t-2 border-gray-300"></div>
              <span className="shrink-0 px-3 font-bold text-xs text-gray-400">or login with another account</span>
              <div className="grow border-t-2 border-gray-300"></div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="p-3 border-3 border-brutal-black bg-brutal-mint text-brutal-black font-bold shadow-brutal-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 border-3 border-brutal-black bg-red-400 text-brutal-black font-bold shadow-brutal-sm">
            {error}
          </div>
        )}

        <Button variant="white" className="w-full text-lg gap-2" onClick={handleGoogleLogin}>
           <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
           </svg>
           Google Sign-In
        </Button>

        <div className="relative flex items-center py-2">
          <div className="grow border-t-3 border-brutal-black"></div>
          <span className="shrink-0 px-4 font-bold text-sm bg-brutal-yellow border-3 border-brutal-black rounded-full mx-2 shadow-[2px_2px_0px_#000]">OR</span>
          <div className="grow border-t-3 border-brutal-black"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-black">Email</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-black">Password</label>
            <PasswordInput required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" variant="default" className="w-full text-lg mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Login with Email'}
          </Button>
        </form>

        <p className="text-center font-bold pb-2 pt-4">
          Don&apos;t have an account? <Link href="/register" className="bg-brutal-mint px-2 py-1 border-2 border-brutal-black hover:bg-brutal-yellow transition-colors shadow-[2px_2px_0px_#000]">Register</Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="w-16 h-16 bg-brutal-pink border-4 border-brutal-black shadow-brutal animate-bounce mx-auto mt-40"></div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
