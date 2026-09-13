"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

const DEFAULT_ADMIN_EMAILS = [
  "vatsalvadgama04@gmail.com",
  "vatsalvadgama05@gmail.com"
];

export function checkIsAdminEmail(email) {
  if (!email) return false;
  const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  const allAdmins = [...new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins])];
  return allAdmins.includes(email.toLowerCase());
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) {
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }

        const email = session.user.email;
        if (checkIsAdminEmail(email)) {
          if (isMounted) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Verify with backend user profile role
        try {
          const { data } = await api.get("/users/me");
          if (isMounted) {
            setIsAdmin(data?.role === "ADMIN");
            setLoading(false);
          }
        } catch {
          if (isMounted) {
            setIsAdmin(false);
            setLoading(false);
          }
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
}
