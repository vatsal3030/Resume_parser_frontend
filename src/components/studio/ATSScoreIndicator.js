"use client";
import { useMemo } from "react";
import { calculateATSScore } from "@/lib/ats-validator";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const GRADE_STYLES = {
  A: { bg: "bg-green-500", text: "text-white", icon: CheckCircle, label: "Excellent" },
  B: { bg: "bg-brutal-blue", text: "text-white", icon: CheckCircle, label: "Good" },
  C: { bg: "bg-brutal-yellow", text: "text-black", icon: AlertTriangle, label: "Needs Work" },
  D: { bg: "bg-red-500", text: "text-white", icon: XCircle, label: "Poor" },
};

export function ATSScoreIndicator({ data, className = "" }) {
  const result = useMemo(() => calculateATSScore(data), [data]);
  const style = GRADE_STYLES[result.grade] || GRADE_STYLES.D;
  const Icon = style.icon;

  return (
    <div className={`border-4 border-brutal-black bg-white p-4 shadow-brutal ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-black text-sm uppercase">ATS Score</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 border-2 border-brutal-black font-black text-lg ${style.bg} ${style.text}`}>
          <Icon className="w-4 h-4" />
          {result.score}
        </div>
      </div>

      {/* Score bar */}
      <div className="h-3 bg-gray-200 border-2 border-brutal-black mb-3">
        <div className={`h-full ${style.bg} transition-all duration-500`} style={{ width: `${result.score}%` }} />
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase text-gray-500">Improvements:</p>
          {result.issues.slice(0, 5).map((issue, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[10px]">
              <AlertTriangle className="w-3 h-3 text-brutal-yellow shrink-0 mt-0.5" />
              <span className="font-medium">{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
