"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, LayoutDashboard, Bug, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    console.error("Global boundary caught error:", error);
    // Glitch animation loop
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, [error]);

  return (
    <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-brutal-pink border-4 border-brutal-black rotate-12 opacity-20" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-brutal-yellow border-4 border-brutal-black -rotate-6 opacity-20" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-brutal-mint border-4 border-brutal-black rotate-45 opacity-15" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Error Icon with glitch effect */}
        <div className="flex justify-center mb-8">
          <div className={`relative w-24 h-24 bg-brutal-yellow border-4 border-brutal-black flex items-center justify-center shadow-[6px_6px_0_#000] ${glitch ? 'translate-x-1 -translate-y-1' : ''} transition-transform`}>
            <AlertTriangle className="w-12 h-12 text-black" />
            {glitch && (
              <div className="absolute inset-0 bg-red-400 border-4 border-brutal-black flex items-center justify-center opacity-80 -translate-x-1 translate-y-1">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_#000] overflow-hidden">
          {/* Header strip */}
          <div className="bg-red-400 border-b-4 border-brutal-black px-6 py-4">
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              Oops! Something Broke
            </h2>
            <p className="text-sm font-bold text-white/80 mt-1">
              Error Code: {error?.digest || 'RUNTIME_ERR'}
            </p>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-gray-700 font-bold leading-relaxed">
              Our servers encountered an unexpected issue. Don&apos;t worry — your data is safe and sound. Try refreshing, or navigate back to safety.
            </p>

            {/* Error details (collapsible) */}
            <div className="border-2 border-brutal-black">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 transition-colors font-black text-xs uppercase tracking-tight"
              >
                <span className="flex items-center gap-2">
                  <Bug className="w-4 h-4" /> Error Details
                </span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showDetails && (
                <div className="p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Button 
                onClick={() => reset()}
                className="w-full justify-center bg-brutal-mint text-black border-3 border-brutal-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-sm uppercase"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button 
                  className="w-full justify-center bg-brutal-yellow text-black border-3 border-brutal-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-sm uppercase"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button 
                  className="w-full justify-center bg-brutal-pink text-black border-3 border-brutal-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black text-sm uppercase"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <p className="text-center text-xs font-bold text-gray-400 mt-6">
          If this keeps happening, try clearing your browser cache or contact support.
        </p>
      </div>
    </div>
  );
}
