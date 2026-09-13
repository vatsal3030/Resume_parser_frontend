"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { accountManager } from '@/lib/accountManager';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Loader2, Zap, X, User } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load saved accounts on mount
  const refreshSavedAccounts = () => {
    setSavedAccounts(accountManager.getSavedAccounts());
  };

  useEffect(() => {
    refreshSavedAccounts();
    window.addEventListener('elevara_accounts_changed', refreshSavedAccounts);
    return () => window.removeEventListener('elevara_accounts_changed', refreshSavedAccounts);
  }, []);

  // Check for redirect messages (e.g. from register page)
  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setTimeout(() => setSuccess(decodeURIComponent(msg)), 0);
  }, [searchParams]);

  // Check if adding another account
  const isAddingAccount = searchParams.get('add_account') === 'true';

  // Redirect if already logged in (unless adding an account)
  useEffect(() => {
    if (isAddingAccount) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && !isAddingAccount) {
        router.push('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [router, isAddingAccount]);

  const handleQuickLogin = async (acc) => {
    setError(null);
    setSuccess(null);
    setRestoringId(acc.id);

    // If account has valid session tokens, restore directly without asking password
    if (acc.session?.access_token && acc.session?.refresh_token) {
      const res = await accountManager.restoreSession(acc.id, supabase);
      if (res.success) {
        setSuccess(`Welcome back, ${acc.name || acc.email}! Redirecting...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 300);
        return;
      }
    }

    // If session expired or missing tokens, prefill email and prompt for password
    setEmail(acc.email);
    setRestoringId(null);
    setError(`Session expired for ${acc.email}. Please enter your password to renew access.`);
  };

  const removeSavedAccount = (e, accountId) => {
    e.stopPropagation();
    accountManager.removeAccount(accountId);
    refreshSavedAccounts();
  };

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

    if (data?.session && data?.user) {
      // Save account with session tokens into unified account manager
      accountManager.saveAccount({
        user: data.user,
        session: data.session
      });
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

  return (
    <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-sm">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-serif text-3xl font-medium text-(--ink)">
          {isAddingAccount ? 'Add Another Account' : 'Welcome Back'}
        </CardTitle>
        <CardDescription className="text-xs text-(--muted)">
          {isAddingAccount ? 'Sign in to link another profile to this browser' : 'Sign in to your Elevara account'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        {/* Saved Accounts Section */}
        {savedAccounts.length > 0 && !isAddingAccount && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-(--muted) flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-(--primary)" />
                Quick Login — 1-Click Access
              </p>
              <span className="text-[10px] text-(--muted-soft)">No password required</span>
            </div>

            <div className="space-y-2">
              {savedAccounts.map((acc) => {
                const isRestoring = restoringId === acc.id;
                return (
                  <div 
                    key={acc.id} 
                    className="flex items-center gap-3 p-3 rounded-xl border border-(--hairline) bg-(--surface-soft)/50 hover:bg-(--surface-soft) hover:border-(--primary)/40 cursor-pointer shadow-xs transition-all group relative"
                    onClick={() => !isRestoring && handleQuickLogin(acc)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-(--surface-card) border border-(--hairline-soft) flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {acc.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={acc.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-sm font-medium text-(--ink)">
                          {(acc.name || acc.email)?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-(--ink) truncate">{acc.name || 'User'}</p>
                      <p className="text-[11px] text-(--muted) truncate">{acc.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isRestoring ? (
                        <div className="flex items-center gap-1 text-[11px] text-(--primary) font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Logging in...
                        </div>
                      ) : (
                        <button
                          onClick={(e) => removeSavedAccount(e, acc.id)}
                          className="p-1 text-(--muted-soft) hover:text-red-500 rounded-lg hover:bg-(--surface-card) opacity-40 group-hover:opacity-100 transition-all"
                          title="Remove saved account"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative flex items-center py-2">
              <div className="grow border-t border-(--hairline-soft)"></div>
              <span className="shrink-0 px-3 text-[11px] font-medium text-(--muted-soft)">or login with password / Google</span>
              <div className="grow border-t border-(--hairline-soft)"></div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in">
            {success}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <Button 
          variant="secondary" 
          className="w-full text-xs font-medium py-2.5 rounded-xl gap-2.5 shadow-xs"
          onClick={handleGoogleLogin}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative flex items-center py-1">
          <div className="grow border-t border-(--hairline-soft)"></div>
          <span className="shrink-0 px-3 text-[10px] font-medium text-(--muted-soft)">OR EMAIL</span>
          <div className="grow border-t border-(--hairline-soft)"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-(--ink)">Email Address</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com"
              className="rounded-xl bg-(--surface-soft) border-(--hairline) text-xs" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-(--ink)">Password</label>
            <PasswordInput 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="rounded-xl bg-(--surface-soft) border-(--hairline) text-xs" 
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-xs font-medium py-2.5 rounded-xl mt-4 shadow-sm" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In with Password'}
          </Button>
        </form>

        <p className="text-center text-xs text-(--muted) pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-(--primary) font-medium hover:underline transition-colors">
            Register for Free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 bg-(--canvas)">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="w-8 h-8 rounded-full border border-(--primary)/30 border-t-(--primary) animate-spin mx-auto mt-40"></div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
