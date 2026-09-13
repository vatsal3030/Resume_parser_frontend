"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AdminLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }

        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'vatsalvadgama04@gmail.com,vatsalvadgama05@gmail.com')
          .split(',')
          .map(e => e.trim().toLowerCase());
        
        const isEmailAdmin = session.user.email && adminEmails.includes(session.user.email.toLowerCase());

        try {
          const { data } = await api.get('/users/me');
          if (data?.role === 'ADMIN' || isEmailAdmin) {
            if (isMounted) setIsAdmin(true);
            return;
          }
        } catch {
          if (isEmailAdmin) {
            if (isMounted) setIsAdmin(true);
            return;
          }
        }

        if (isMounted) {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      } catch (e) {
        if (isMounted) {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      }
    };

    checkAdmin();
    return () => { isMounted = false; };
  }, [router]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-(--canvas) flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-(--primary) mb-3" />
        <p className="text-xs font-medium text-(--muted)">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-(--canvas) text-(--ink) transition-colors flex flex-col">
      {/* Admin Navigation Bar */}
      <header className="h-16 border-b border-(--hairline) bg-(--surface-card)/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1 text-xs text-(--muted) hover:text-(--ink) transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to</span> Dashboard
          </Link>
          <div className="h-4 w-px bg-(--hairline)" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-base font-medium text-(--ink)">Elevara Command</span>
              <span className="ml-2 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Live Console
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="secondary" size="sm" className="text-xs">
              User App
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        {children}
      </main>
    </div>
  );
}
