"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-4 border-brutal-black shadow-[8px_8px_0_#000] p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-brutal-yellow border-4 border-brutal-black flex items-center justify-center mb-6 shadow-[4px_4px_0_#000]">
          <AlertTriangle className="w-8 h-8 text-black" />
        </div>
        
        <h2 className="text-2xl font-black uppercase tracking-tight">System Error</h2>
        <p className="text-gray-600 font-medium">
          Our servers encountered an unexpected issue while processing your request. Don&apos;t worry, your data is safe.
        </p>

        <div className="bg-gray-100 p-4 border-2 border-brutal-black text-left overflow-x-auto">
          <p className="text-xs font-mono text-red-600 whitespace-pre-wrap wrap-break-word">
            {error.message || "An unknown error occurred"}
          </p>
        </div>

        <div className="pt-4">
          <Button 
            onClick={() => reset()}
            variant="brutal"
            className="w-full justify-center bg-brutal-mint text-black border-4 border-brutal-black shadow-[4px_4px_0_#000]"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
