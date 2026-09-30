"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { accountManager } from '@/lib/accountManager';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Loader2, Zap, X, ArrowRight, ArrowLeft, Shield, Sparkles, 
  CheckCircle2, Star, Target, Brain, Award 
} from 'lucide-react';

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
    <div className="w-full max-w-[420px] mx-auto space-y-5">
      {/* Title & Subtitle */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-(--ink) tracking-tight">
          {isAddingAccount ? 'Add Another Account' : 'Welcome back'}
        </h1>
        <p className="text-sm sm:text-base text-(--muted) font-normal leading-relaxed">
          {isAddingAccount ? 'Sign in to link another profile' : 'Sign in to access your career intelligence dashboard'}
        </p>
      </div>

      {/* Saved Accounts Section */}
      {savedAccounts.length > 0 && !isAddingAccount && (
        <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-soft)/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-(--ink) flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-(--primary)" />
              Quick Login
            </p>
            <span className="text-xs text-(--muted)">1-click access</span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {savedAccounts.map((acc) => {
              const isRestoring = restoringId === acc.id;
              return (
                <div 
                  key={acc.id} 
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-(--hairline) bg-(--surface-card) hover:border-(--primary)/50 cursor-pointer shadow-xs transition-all duration-200 group"
                  onClick={() => !isRestoring && handleQuickLogin(acc)}
                >
                  <div className="w-8 h-8 rounded-lg bg-(--surface-soft) border border-(--hairline) flex items-center justify-center overflow-hidden shrink-0">
                    {acc.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={acc.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-sm font-semibold text-(--ink)">
                        {(acc.name || acc.email)?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-(--ink) truncate">{acc.name || 'User'}</p>
                    <p className="text-[11px] text-(--muted) truncate">{acc.email}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    {isRestoring ? (
                      <div className="flex items-center gap-1 text-xs text-(--primary) font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => removeSavedAccount(e, acc.id)}
                        className="p-1 text-(--muted-soft) hover:text-red-500 rounded-md hover:bg-(--surface-soft) opacity-0 group-hover:opacity-100 transition-all"
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
        </div>
      )}
      
      {/* Alert Messages */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Google OAuth Button */}
      <Button 
        type="button"
        variant="secondary" 
        className="w-full text-sm font-medium h-11 rounded-xl gap-3 shadow-xs border border-(--hairline) hover:border-(--hairline-soft) hover:bg-(--surface-soft) transition-all"
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

      {/* Divider */}
      <div className="relative flex items-center py-0.5">
        <div className="grow border-t border-(--hairline)"></div>
        <span className="shrink-0 px-3 text-[11px] font-semibold tracking-wider uppercase text-(--muted)">OR EMAIL</span>
        <div className="grow border-t border-(--hairline)"></div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleLogin} className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-(--ink) uppercase tracking-wide">Email Address</label>
          <Input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="you@example.com"
            className="h-11 rounded-xl bg-(--surface-soft) border-(--hairline) text-sm px-3.5 focus:border-(--primary)" 
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-(--ink) uppercase tracking-wide">Password</label>
          </div>
          <PasswordInput 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••"
            className="h-11 rounded-xl bg-(--surface-soft) border-(--hairline) text-sm px-3.5 focus:border-(--primary)" 
          />
        </div>
        <Button 
          type="submit" 
          className="w-full text-sm font-semibold h-11 rounded-xl mt-2 shadow-sm hover:shadow-md transition-all group" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      {/* Footer Switch */}
      <p className="text-center text-xs sm:text-sm text-(--muted) pt-1">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-(--primary) font-semibold hover:underline transition-colors">
          Register for Free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-(--canvas) text-(--ink) overflow-x-hidden">
      {/* ─── LEFT COLUMN: Branding & Showcase (Visible on Large Screens) ─── */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-8 xl:p-12 relative overflow-hidden bg-gradient-to-br from-(--canvas) via-(--surface-soft)/50 to-(--surface-soft) border-r border-(--hairline)">
        {/* Ambient background glows & grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-(--primary)/12 to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--ink) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        </div>

        {/* Top: Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-(--primary) to-(--primary-active) rounded-xl flex items-center justify-center text-white font-serif font-semibold text-xl shadow-md group-hover:scale-105 transition-transform">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-semibold tracking-tight text-(--ink)">Elevara</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-(--muted) -mt-1">Career Intelligence</span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-md text-xs font-medium text-(--muted)">
            <Sparkles className="w-3.5 h-3.5 text-(--primary)" />
            <span>AI Career Workspace</span>
          </div>
        </div>

        {/* Middle: Hero Content & Showcase */}
        <div className="relative z-10 my-auto py-6 max-w-xl space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--primary) bg-(--primary)/10 px-3 py-1 rounded-lg border border-(--primary)/20">
              <Award className="w-3.5 h-3.5" />
              Trusted by 50,000+ job seekers
            </div>
            <h2 className="text-3xl xl:text-4xl font-serif font-normal text-(--ink) leading-[1.2] tracking-tight">
              Elevate your career trajectory with precision intelligence.
            </h2>
            <p className="text-sm xl:text-base text-(--muted) font-normal leading-relaxed">
              Automated ATS resume scoring, 5-stage voice mock interviews, tailored job applications, and structured career roadmaps — designed to get you hired faster.
            </p>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-sm space-y-1 shadow-xs">
              <div className="text-xl font-bold font-serif text-(--ink)">94%</div>
              <div className="text-xs text-(--muted) font-medium">ATS Match Rate</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-sm space-y-1 shadow-xs">
              <div className="text-xl font-bold font-serif text-(--ink)">5-Round</div>
              <div className="text-xs text-(--muted) font-medium">Voice Mock AI</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-sm space-y-1 shadow-xs">
              <div className="text-xl font-bold font-serif text-(--ink)">50 Free</div>
              <div className="text-xs text-(--muted) font-medium">Starter Credits</div>
            </div>
          </div>

          {/* Testimonial Quote Card */}
          <div className="p-4 rounded-2xl border border-(--hairline) bg-(--surface-card)/90 backdrop-blur-md space-y-2.5 shadow-sm">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs xl:text-sm text-(--ink) italic font-serif leading-relaxed">
              &ldquo;Elevara transformed how I interview. The ATS feedback showed me exactly what keywords I missed, and the mock interviews gave me the confidence to land a senior role at Google.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-full bg-(--primary)/20 text-(--primary) flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="text-xs">
                <span className="font-semibold text-(--ink)">Arjun Mehta</span>
                <span className="text-(--muted)"> • Senior Software Engineer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Trust & Security */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-(--hairline) text-xs text-(--muted)">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>256-bit SSL encrypted & GDPR compliant</span>
          </div>
          <span className="font-mono text-[11px]">career.vixora.co.in</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Form Area (Fit in One Page) ─── */}
      <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-(--surface-card) relative lg:overflow-y-auto">
        {/* Top Header inside Form Column */}
        <div className="flex items-center justify-between pb-4">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-(--primary) to-(--primary-active) rounded-lg flex items-center justify-center text-white font-serif font-semibold text-base shadow-xs">
                E
              </div>
              <span className="text-xl font-serif font-semibold tracking-tight text-(--ink)">Elevara</span>
            </Link>
          </div>

          <div className="hidden lg:block">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-medium text-(--muted) hover:text-(--ink) transition-colors py-1.5 px-2.5 rounded-lg hover:bg-(--surface-soft) border border-transparent hover:border-(--hairline)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to site
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Center: The Form */}
        <div className="my-auto py-4">
          <Suspense fallback={
            <div className="w-10 h-10 rounded-full border-2 border-(--primary)/30 border-t-(--primary) animate-spin mx-auto my-20"></div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom: Security Notice */}
        <div className="pt-4 border-t border-(--hairline) flex items-center justify-between text-[11px] text-(--muted)">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure SSL connection</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Elevara</span>
        </div>
      </div>
    </div>
  );
}
