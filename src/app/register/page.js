"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';

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
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
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
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="bg-brutal-mint border-b-4 border-brutal-black">
            <CardTitle>{step === 1 ? 'Create Account' : 'Choose Your Avatar'}</CardTitle>
            <CardDescription className="text-brutal-black">
              {step === 1 ? 'Start analyzing resumes instantly' : 'Pick a fun identity to get started!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {error && (
              <div className="p-3 border-3 border-brutal-black bg-red-400 text-brutal-black font-bold shadow-brutal-sm">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <Button variant="white" className="w-full text-lg gap-2" onClick={handleGoogleLogin}>
                   <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                   </svg>
                   Google Sign-Up
                </Button>

                <div className="relative flex items-center py-2">
                  <div className="grow border-t-3 border-brutal-black"></div>
                  <span className="shrink-0 px-4 font-bold text-sm bg-brutal-yellow border-3 border-brutal-black rounded-full mx-2 shadow-[2px_2px_0px_#000]">OR</span>
                  <div className="grow border-t-3 border-brutal-black"></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-black">Full Name</label>
                    <Input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-black">Email</label>
                    <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-black">Password</label>
                    <PasswordInput required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
                  </div>
                  <Button type="submit" variant="default" className="w-full text-lg mt-4" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <p className="text-center font-bold pb-2 pt-4">
                  Already have an account? <Link href="/login" className="bg-brutal-pink px-2 py-1 border-2 border-brutal-black hover:bg-brutal-yellow transition-colors shadow-[2px_2px_0px_#000]">Sign In</Link>
                </p>
              </>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {avatarOptions.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(url)}
                      className={`relative w-full aspect-square border-4 transition-all ${selectedAvatar === url ? 'border-brutal-black bg-brutal-yellow shadow-[4px_4px_0px_#000] scale-105' : 'border-transparent bg-brutal-bg hover:border-brutal-black hover:shadow-brutal-sm'}`}
                    >
                      <Image src={url} alt={`Avatar option ${index + 1}`} fill className="p-2 object-cover" unoptimized />
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="white" className="flex-1" onClick={() => router.push('/dashboard')}>
                    Skip for now
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1 bg-brutal-blue" 
                    disabled={!selectedAvatar || loading}
                    onClick={handleSaveAvatar}
                  >
                    {loading ? 'Saving...' : 'Looks Good!'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
