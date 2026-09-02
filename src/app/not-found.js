"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-(--canvas) text-(--ink) flex flex-col items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-(--primary)/10 border border-(--primary)/20 text-(--primary) flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-medium text-(--primary) bg-(--primary)/10 border border-(--primary)/20 px-2.5 py-0.5 rounded-full">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-(--ink)">
            Page Not Found
          </h1>
          <p className="text-xs text-(--muted) max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been moved, deleted, or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-xs mx-auto">
          <Link href="/dashboard" className="w-full sm:w-auto flex-1">
            <Button className="w-full text-xs py-2.5 rounded-xl">
              <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
              Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto flex-1">
            <Button variant="secondary" className="w-full text-xs py-2.5 rounded-xl">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
