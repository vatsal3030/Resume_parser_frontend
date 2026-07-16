"use client";
import { useState, useEffect } from "react";
import { Coins, TrendingDown, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * CreditBalance — Displays user's credit balance in the sidebar/header.
 * Fetches from /users/me and shows warning when low.
 */
export function CreditBalance({ className = "" }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/me`)
      .then(res => setBalance(res.data.profile?.creditBalance ?? 0))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={`h-8 w-20 bg-gray-200 animate-pulse border-2 border-brutal-black ${className}`} />;

  const isLow = balance !== null && balance <= 10;
  const isEmpty = balance !== null && balance <= 0;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 border-2 border-brutal-black font-black text-sm ${
      isEmpty ? "bg-red-400 text-white" : isLow ? "bg-brutal-yellow" : "bg-brutal-mint"
    } ${className}`}>
      {isEmpty ? <AlertTriangle className="w-3.5 h-3.5" /> : isLow ? <TrendingDown className="w-3.5 h-3.5" /> : <Coins className="w-3.5 h-3.5" />}
      <span>{balance ?? 0}</span>
      <span className="text-[9px] font-bold opacity-70">credits</span>
    </div>
  );
}

/**
 * CreditCostBadge — Shows the credit cost for a specific tool.
 * Used inline on tool pages next to the "Generate" button.
 */
export function CreditCostBadge({ cost = 1, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-black border border-brutal-black bg-brutal-yellow ${className}`}>
      <Coins className="w-2.5 h-2.5" />
      {cost} credit{cost > 1 ? "s" : ""}
    </span>
  );
}
