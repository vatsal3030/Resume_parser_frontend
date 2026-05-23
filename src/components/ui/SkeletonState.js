import React from 'react';

// Reusable Brutalist Skeleton Line with shimmer
export function SkeletonLine({ className = "", width = "w-full", height = "h-4" }) {
  return (
    <div className={`bg-gray-200 border-2 border-brutal-black skeleton-shimmer ${width} ${height} ${className}`}></div>
  );
}

// Reusable Brutalist Skeleton Block (for images, empty areas) with shimmer
export function SkeletonBlock({ className = "", width = "w-full", height = "h-32" }) {
  return (
    <div className={`bg-gray-200 border-4 border-brutal-black shadow-brutal skeleton-shimmer ${width} ${height} ${className}`}></div>
  );
}

// A full Skeleton Card layout with shimmer animation
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white border-4 border-brutal-black p-6 shadow-brutal-lg flex flex-col gap-4 animate-fade-in ${className}`}>
      <div className="flex items-center gap-4">
        <SkeletonBlock width="w-12" height="h-12" className="shadow-brutal-sm" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-3/4" height="h-6" />
          <SkeletonLine width="w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2">
         <SkeletonBlock height="h-20" className="shadow-brutal-sm" />
         <SkeletonBlock height="h-20" className="shadow-brutal-sm" />
      </div>
      <SkeletonLine height="h-10" className="mt-2" />
    </div>
  );
}

// Skeleton for history panel items
export function SkeletonHistoryItem({ className = "" }) {
  return (
    <div className={`p-3 border-b-2 border-gray-200 animate-fade-in ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <SkeletonBlock width="w-6" height="h-6" className="border-2" />
        <SkeletonLine width="w-16" height="h-3" />
      </div>
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-1/3" height="h-2" className="mt-1" />
    </div>
  );
}

// A full-page Skeleton loader layout (for when the entire page is loading)
export function SkeletonPage() {
  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-4">
        <SkeletonLine width="w-1/3" height="h-12" />
        <SkeletonLine width="w-1/4" height="h-8" />
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
