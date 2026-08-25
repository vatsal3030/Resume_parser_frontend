"use client";
import React from "react";

/**
 * ResultSkeleton — Brutalist animated skeleton for tool result loading states.
 * Shows when history items are being fetched from the API.
 */
export function ResultSkeleton({ lines = 5, showHeader = true }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {showHeader && (
        <div className="flex gap-3 items-center">
          <div className="h-8 w-48 bg-gray-200 border-2 border-brutal-black animate-pulse" />
          <div className="h-6 w-24 bg-gray-100 border-2 border-brutal-black animate-pulse" />
        </div>
      )}

      <div className="border-4 border-brutal-black bg-white p-6 shadow-[4px_4px_0_rgba(0,0,0,1)]">
        {/* Title skeleton */}
        <div className="h-6 w-3/5 bg-gray-200 border-2 border-brutal-black mb-6 animate-pulse" />
        
        {/* Content line skeletons */}
        <div className="space-y-4">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center" style={{ animationDelay: `${i * 100}ms` }}>
              <div 
                className="h-4 bg-gray-100 border border-gray-300 animate-pulse"
                style={{ 
                  width: `${65 + Math.sin(i * 1.5) * 25}%`,
                  animationDelay: `${i * 150}ms`
                }}
              />
            </div>
          ))}
        </div>

        {/* Action bar skeleton */}
        <div className="mt-8 pt-4 border-t-2 border-gray-200 flex gap-3">
          <div className="h-9 w-24 bg-gray-100 border-2 border-brutal-black animate-pulse" />
          <div className="h-9 w-20 bg-gray-100 border-2 border-brutal-black animate-pulse" />
        </div>
      </div>

      {/* Secondary card skeleton */}
      <div className="border-4 border-brutal-black bg-white p-6 shadow-[4px_4px_0_rgba(0,0,0,1)]">
        <div className="h-5 w-2/5 bg-gray-200 border-2 border-brutal-black mb-4 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="h-4 bg-gray-100 border border-gray-300 animate-pulse"
              style={{ 
                width: `${50 + Math.cos(i * 2) * 30}%`,
                animationDelay: `${(lines + i) * 150}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4 gap-3">
        <div className="w-5 h-5 border-3 border-brutal-black border-t-transparent rounded-full animate-spin" />
        <span className="font-black text-sm uppercase tracking-widest text-gray-500 animate-pulse">
          Loading Result...
        </span>
      </div>
    </div>
  );
}
