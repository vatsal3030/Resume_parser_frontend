"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Coins, TrendingDown, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

/**
 * CreditBalance — Displays user's live credit balance in the header and sidebar.
 * Claude Editorial Glassmorphic styling.
 */
export function CreditBalance({ className = "", compact = false, showTopUp = true }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me');
      const current = data?.creditBalance ?? data?.credits ?? data?.profile?.creditBalance ?? 0;
      setBalance(current);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();

    const handleSync = (e) => {
      if (typeof e.detail?.creditBalance === 'number') {
        setBalance(e.detail.creditBalance);
      } else {
        fetchBalance();
      }
    };

    window.addEventListener('creditsUpdated', handleSync);
    window.addEventListener('profileAvatarUpdated', fetchBalance);

    return () => {
      window.removeEventListener('creditsUpdated', handleSync);
      window.removeEventListener('profileAvatarUpdated', fetchBalance);
    };
  }, [fetchBalance]);

  if (loading) {
    return (
      <div className={`h-8 w-20 bg-(--surface-soft) animate-pulse rounded-full ${className}`} />
    );
  }

  const isLow = balance !== null && balance <= 20;
  const isEmpty = balance !== null && balance <= 0;

  return (
    <Link 
      href="/dashboard/credits" 
      title={`Current Balance: ${balance ?? 0} Credits — Click to Top Up`}
      className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none border ${
        isEmpty 
          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/15" 
          : isLow 
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15" 
          : "bg-(--surface-soft) text-(--ink) border-(--hairline) hover:bg-(--surface-card) hover:border-(--primary)/40 shadow-xs"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {isEmpty ? (
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-red-500" />
        ) : isLow ? (
          <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Coins className="w-3.5 h-3.5 text-(--primary) group-hover:rotate-12 transition-transform" />
        )}
        <span className="font-semibold tabular-nums">{balance ?? 0}</span>
        {!compact && <span className="text-[10px] text-(--muted) font-medium">credits</span>}
      </div>

      {showTopUp && !compact && (
        <span className="w-3.5 h-3.5 bg-(--primary)/15 text-(--primary) rounded-full flex items-center justify-center text-[10px] ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" title="Buy more credits">
          +
        </span>
      )}
    </Link>
  );
}

/**
 * CreditCostBadge — Shows the credit cost for a specific tool.
 */
export function CreditCostBadge({ cost = 10, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
      <Coins className="w-3 h-3" />
      {cost} credits
    </span>
  );
}
