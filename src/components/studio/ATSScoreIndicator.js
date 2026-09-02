"use client";
import { useMemo } from "react";
import { calculateATSScore } from "@/lib/ats-validator";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function ATSScoreIndicator({ data, className = "" }) {
  const result = useMemo(() => calculateATSScore(data), [data]);
  
  const isHigh = result.score >= 80;
  const isMedium = result.score >= 60;

  return (
    <div className={`rounded-2xl border border-(--hairline) bg-(--surface-card) p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-(--ink)">
          <Shield className="w-4 h-4 text-(--primary)" />
          <span className="font-serif font-medium text-sm">ATS Score</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-(--hairline-soft) bg-(--surface-soft) font-mono text-sm font-semibold text-(--primary)">
          {result.score}/100
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-(--surface-soft) rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-red-500'
          }`} 
          style={{ width: `${result.score}%` }} 
        />
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-(--hairline-soft)">
          <p className="text-[10px] uppercase tracking-wider font-medium text-(--muted)">Improvements:</p>
          {result.issues.slice(0, 4).map((issue, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-(--body)">
              <AlertTriangle className="w-3 h-3 text-(--primary) shrink-0 mt-0.5" />
              <span className="leading-snug">{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
