"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Coins, TrendingDown, AlertTriangle, Plus } from "lucide-react";
import api from "@/lib/api";

/**
 * CreditBalance — Displays user's live credit balance in the header and sidebar.
 * Listens to 'creditsUpdated' window events to auto-refresh whenever credits change.
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
      <div className={`h-9 w-24 bg-gray-200 animate-pulse border-2 border-brutal-black shadow-[2px_2px_0_#000] ${className}`} />
    );
  }

  const isLow = balance !== null && balance <= 20;
  const isEmpty = balance !== null && balance <= 0;

  return (
    <Link 
      href="/dashboard/credits" 
      title={`Current Balance: ${balance ?? 0} Credits — Click to Top Up`}
      className={`group inline-flex items-center gap-2 px-3 py-1.5 border-2 border-brutal-black font-black text-xs uppercase tracking-tight shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer select-none ${
        isEmpty 
          ? "bg-red-400 text-white" 
          : isLow 
            ? "bg-brutal-yellow text-black" 
            : "bg-brutal-mint text-black"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {isEmpty ? (
          <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
        ) : isLow ? (
          <TrendingDown className="w-3.5 h-3.5 text-black" />
        ) : (
          <Coins className="w-3.5 h-3.5 text-black group-hover:rotate-12 transition-transform" />
        )}
        <span className="font-black text-sm">{balance ?? 0}</span>
        {!compact && <span className="text-[10px] font-black opacity-80">Credits</span>}
      </div>

      {showTopUp && !compact && (
        <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[10px] ml-0.5 font-bold group-hover:bg-brutal-yellow group-hover:text-black transition-colors" title="Buy more credits">
          +
        </span>
      )}
    </Link>
  );
}

/**
 * CreditCostBadge — Shows the credit cost for a specific tool.
 * Used inline on tool pages next to the "Generate" button.
 */
export function CreditCostBadge({ cost = 10, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black border border-brutal-black bg-brutal-yellow shadow-[1px_1px_0_#000] ${className}`}>
      <Coins className="w-3 h-3" />
      {cost} credits
    </span>
  );
}
