"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { 
  Loader2, ArrowRight, ArrowLeft, Shield, Sparkles, CheckCircle2, 
  Star, Check, Gift, Zap, Award 
} from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  
  // Pre-generate random seeds for 6 avatars
  const [avatarOptions] = useState(() => 
    Array.from({ length: 6 }).map((_, i) => `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${Math.random().toString(36).substring(7)}`)
  );

  const router = useRouter();

  // If already logged in, go to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only auto-redirect if we aren't in the middle of picking an avatar
      if (event === 'SIGNED_IN' && session && step === 1) {
        router.push('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [router, step]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If Supabase returned a session, move to Step 2 (Avatar Selection)
    if (data?.session) {
      setStep(2);
      setLoading(false);
      return;
    }

    // If no session returned, email confirmation is likely required
    router.push('/login?message=' + encodeURIComponent('Registration successful! Check your email to confirm, then sign in.'));
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

  const handleSaveAvatar = async () => {
    setLoading(true);
    try {
      if (selectedAvatar) {
        // Save the selected avatar URL to our backend database Profile table
        await api.put('/users/me', { avatarUrl: selectedAvatar });
      }
      router.push('/dashboard');
    } catch (err) {
      setError("Failed to save avatar, but your account is ready. Redirecting...");
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-(--canvas) text-(--ink) overflow-x-hidden">
      {/* ─── LEFT COLUMN: Branding & SaaS Showcase ─── */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-8 xl:p-12 relative overflow-hidden bg-gradient-to-br from-(--canvas) via-(--surface-soft)/50 to-(--surface-soft) border-r border-(--hairline)">
        {/* Ambient background glows & subtle grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-(--primary)/12 to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-md text-xs font-semibold text-(--muted)">
            <Gift className="w-3.5 h-3.5 text-emerald-500" />
            <span>50 Free Credits Included</span>
          </div>
        </div>

        {/* Middle: Value Proposition & Showcase */}
        <div className="relative z-10 my-auto py-6 max-w-xl space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              <Award className="w-3.5 h-3.5" />
              Join 50,000+ candidates landing dream jobs
            </div>
            <h2 className="text-3xl xl:text-4xl font-serif font-normal text-(--ink) leading-[1.2] tracking-tight">
              Transform your job hunt into a predictable, winning system.
            </h2>
            <p className="text-sm xl:text-base text-(--muted) font-normal leading-relaxed">
              Create your account in under 30 seconds. Get immediate access to multi-domain ATS scoring, AI interview simulators, custom bullet tailoring, and personalized learning milestones.
            </p>
          </div>

          {/* Perks Bullet Strip */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-sm space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="w-4 h-4" />
                <span className="text-xs font-semibold">Zero Cost</span>
              </div>
              <div className="text-xs text-(--muted) font-medium">No credit card required</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-sm space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-(--primary)">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">All 6 Tools</span>
              </div>
              <div className="text-xs text-(--muted) font-medium">Full feature access</div>
            </div>
            <div className="p-3.5 rounded-2xl border border-(--hairline) bg-(--surface-card)/80 backdrop-blur-sm space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-semibold">Instant AI</span>
              </div>
              <div className="text-xs text-(--muted) font-medium">Results in &lt; 5 seconds</div>
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
              &ldquo;Within 48 hours of using Elevara&apos;s ATS analysis and mock interview simulation, I felt 10x more prepared. Ended up getting offers from Amazon and Stripe.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div className="text-xs">
                <span className="font-semibold text-(--ink)">Sneha Patel</span>
                <span className="text-(--muted)"> • Product Manager @ Fintech</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Trust & Security */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-(--hairline) text-xs text-(--muted)">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Enterprise 256-bit encryption • No spam guarantee</span>
          </div>
          <span className="font-mono text-[11px]">career.vixora.co.in</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: Form Area (Fit in One Page) ─── */}
      <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-(--surface-card) relative lg:overflow-y-auto">
        {/* Top Header inside Form Column */}
        <div className="flex items-center justify-between pb-3">
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

        {/* Center: The Registration Form / Step */}
        <div className="my-auto py-2">
          <div className="w-full max-w-[420px] mx-auto space-y-4">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-(--ink) tracking-tight">
                {step === 1 ? 'Create Your Account' : 'Choose Your Avatar'}
              </h1>
              <p className="text-xs sm:text-sm text-(--muted) font-normal leading-relaxed">
                {step === 1 ? 'Get started with 50 free credits — no credit card needed' : 'Pick a personality to represent you on Elevara'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                {/* Benefits Mini Strip */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-(--hairline) bg-(--surface-soft)/40 text-[11px] text-(--muted) font-medium">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 50 Free Credits
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No Card Needed
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> All 6 AI Tools
                  </span>
                </div>

                {/* Google Sign Up Button */}
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
                  Sign Up with Google
                </Button>

                {/* Divider */}
                <div className="relative flex items-center py-0.5">
                  <div className="grow border-t border-(--hairline)"></div>
                  <span className="shrink-0 px-3 text-[11px] font-semibold tracking-wider uppercase text-(--muted)">OR EMAIL</span>
                  <div className="grow border-t border-(--hairline)"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-(--ink) uppercase tracking-wide">Full Name</label>
                    <Input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Alex Smith" 
                      className="h-10 rounded-xl bg-(--surface-soft) border-(--hairline) text-sm px-3.5 focus:border-(--primary)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-(--ink) uppercase tracking-wide">Email Address</label>
                    <Input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="alex@example.com" 
                      className="h-10 rounded-xl bg-(--surface-soft) border-(--hairline) text-sm px-3.5 focus:border-(--primary)"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-(--ink) uppercase tracking-wide">Password</label>
                    <PasswordInput 
                      required 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="Minimum 6 characters" 
                      className="h-10 rounded-xl bg-(--surface-soft) border-(--hairline) text-sm px-3.5 focus:border-(--primary)"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-sm font-semibold h-11 rounded-xl mt-2 shadow-sm hover:shadow-md transition-all group" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Free Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Footer Switch */}
                <p className="text-center text-xs sm:text-sm text-(--muted) pt-1">
                  Already have an account?{' '}
                  <Link href="/login" className="text-(--primary) font-semibold hover:underline transition-colors">
                    Sign In
                  </Link>
                </p>
              </>
            ) : (
              /* Step 2: Avatar Selection */
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {avatarOptions.map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative w-full aspect-square rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                        selectedAvatar === url 
                          ? 'border-(--primary) bg-(--primary)/10 shadow-sm scale-[1.03] ring-2 ring-(--primary)/20' 
                          : 'border-(--hairline) bg-(--surface-soft) hover:border-(--primary)/40 hover:shadow-xs'
                      }`}
                    >
                      <Image src={url} alt={`Avatar option ${index + 1}`} fill className="p-2.5 object-cover" unoptimized />
                      {selectedAvatar === url && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-(--primary) rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2.5 pt-2">
                  <Button 
                    type="button"
                    variant="secondary" 
                    className="flex-1 text-xs sm:text-sm h-10 rounded-xl border border-(--hairline)" 
                    onClick={() => router.push('/dashboard')}
                  >
                    Skip for now
                  </Button>
                  <Button 
                    type="button"
                    className="flex-1 text-xs sm:text-sm h-10 rounded-xl shadow-sm hover:shadow-md transition-all group" 
                    disabled={!selectedAvatar || loading}
                    onClick={handleSaveAvatar}
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Confirm <Sparkles className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Terms & Security Notice */}
        <div className="pt-3 border-t border-(--hairline) flex items-center justify-between text-[11px] text-(--muted)">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit SSL encrypted</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Elevara</span>
        </div>
      </div>
    </div>
  );
}
