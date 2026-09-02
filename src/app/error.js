"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, LayoutDashboard, Bug, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("Global boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-(--canvas) text-(--ink) flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      <div className="max-w-md w-full relative z-10">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xs">
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>

        {/* Main card */}
        <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-medium text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
              {error?.digest ? `Code: ${error.digest}` : 'Runtime Exception'}
            </span>
            <h2 className="text-2xl font-serif font-medium text-(--ink)">
              Something Went Wrong
            </h2>
            <p className="text-xs text-(--muted) leading-relaxed">
              An unexpected issue occurred while rendering this page. Your data is safe. Try refreshing or navigating back to the dashboard.
            </p>
          </div>

          {/* Error details (collapsible) */}
          <div className="rounded-xl border border-(--hairline-soft) bg-(--surface-soft) overflow-hidden">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-3 hover:bg-(--surface-card)/60 transition-colors font-medium text-xs text-(--muted) hover:text-(--ink)"
            >
              <span className="flex items-center gap-2">
                <Bug className="w-3.5 h-3.5 text-(--primary)" /> Technical Details
              </span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDetails && (
              <div className="p-3.5 bg-(--surface-dark) text-red-300 font-mono text-[11px] overflow-x-auto max-h-48 overflow-y-auto border-t border-(--hairline-soft) leading-relaxed">
                <pre className="whitespace-pre-wrap break-all">
                  {error?.message || "An unknown error occurred"}
                  {error?.stack && (
                    <>
                      {"\n\n--- Stack Trace ---\n"}
                      {error.stack}
                    </>
                  )}
                </pre>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button 
              onClick={() => reset()}
              className="flex-1 text-xs py-2.5 rounded-xl shadow-xs"
            >
              <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button 
                variant="secondary"
                className="w-full text-xs py-2.5 rounded-xl"
              >
                <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-(--muted) hover:text-(--ink) transition-colors inline-flex items-center gap-1.5 font-medium">
            <Home className="w-3.5 h-3.5" /> Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
