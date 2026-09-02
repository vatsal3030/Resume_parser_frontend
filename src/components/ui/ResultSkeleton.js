"use client";
import React from "react";

/**
 * ResultSkeleton — Liquid glass animated skeleton for tool result loading states.
 * Shows when history items are being fetched from the API.
 */
export function ResultSkeleton({ lines = 5, showHeader = true }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {showHeader && (
        <div className="flex gap-3 items-center">
          <div className="h-8 w-48 bg-(--surface-soft) rounded-xl animate-pulse" />
          <div className="h-6 w-24 bg-(--surface-soft) rounded-lg animate-pulse" />
        </div>
      )}

      <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm">
        {/* Title skeleton */}
        <div className="h-6 w-2/5 bg-(--surface-soft) rounded-xl mb-6 animate-pulse" />
        
        {/* Content line skeletons */}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center" style={{ animationDelay: `${i * 100}ms` }}>
              <div 
                className="h-3.5 bg-(--surface-soft) rounded-lg animate-pulse"
                style={{ 
                  width: `${65 + Math.sin(i * 1.5) * 25}%`,
                  animationDelay: `${i * 150}ms`
                }}
              />
            </div>
          ))}
        </div>

        {/* Action bar skeleton */}
        <div className="mt-8 pt-4 border-t border-(--hairline-soft) flex gap-3">
          <div className="h-8 w-24 bg-(--surface-soft) rounded-xl animate-pulse" />
          <div className="h-8 w-20 bg-(--surface-soft) rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Secondary card skeleton */}
      <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm">
        <div className="h-5 w-1/3 bg-(--surface-soft) rounded-xl mb-4 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="h-3.5 bg-(--surface-soft) rounded-lg animate-pulse"
              style={{ 
                width: `${50 + Math.cos(i * 2) * 30}%`,
                animationDelay: `${(lines + i) * 150}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4 gap-2.5">
        <div className="w-4 h-4 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
        <span className="font-medium text-xs text-(--muted) animate-pulse">
          Loading Result...
        </span>
      </div>
    </div>
  );
}
