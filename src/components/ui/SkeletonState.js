import React from 'react';

// Reusable Brutalist Skeleton Line
export function SkeletonLine({ className = "", width = "w-full", height = "h-4" }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${className}`}></div>
  );
}

// Reusable Brutalist Skeleton Block (for images, empty areas)
export function SkeletonBlock({ className = "", width = "w-full", height = "h-32" }) {
  return (
    <div className={`bg-gray-200 border-2 border-gray-300 animate-pulse ${width} ${height} ${className}`}></div>
  );
}

// A full Skeleton Card layout matching resume card structure
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000] flex flex-col gap-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-200 border-3 border-gray-300 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-brutal-bg border-3 border-gray-300 p-4 text-center">
          <div className="h-3 bg-gray-300 rounded w-16 mx-auto mb-2" />
          <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
        </div>
        <div className="bg-brutal-yellow/30 border-3 border-gray-300 p-4 text-center">
          <div className="h-3 bg-gray-300 rounded w-14 mx-auto mb-2" />
          <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
        </div>
      </div>
      <div className="h-10 bg-gray-100 border-3 border-gray-200 rounded mt-2" />
    </div>
  );
}

// Skeleton for history panel items — matches HistoryPanel item structure
export function SkeletonHistoryItem({ className = "" }) {
  return (
    <div className={`border-2 border-gray-200 bg-white p-3 shadow-[2px_2px_0_rgba(0,0,0,0.05)] animate-pulse ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-4 h-4 bg-gray-200 rounded" />
      </div>
      <div className="h-3 bg-gray-300 rounded w-4/5 mb-1.5" />
      <div className="h-2.5 bg-gray-200 rounded w-3/5" />
    </div>
  );
}

// A full-page Skeleton loader layout
export function SkeletonPage() {
  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-4">
        <div className="h-12 bg-gray-300 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/4" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SkeletonBlock height="h-64" />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
