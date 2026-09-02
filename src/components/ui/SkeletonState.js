import React from 'react';

// Reusable Liquid Glass Skeleton Line
export function SkeletonLine({ className = "", width = "w-full", height = "h-4" }) {
  return (
    <div className={`bg-(--surface-soft) rounded-md animate-pulse ${width} ${height} ${className}`}></div>
  );
}

// Reusable Liquid Glass Skeleton Block (for images, empty areas)
export function SkeletonBlock({ className = "", width = "w-full", height = "h-32" }) {
  return (
    <div className={`bg-(--surface-card) border border-(--hairline) rounded-2xl animate-pulse ${width} ${height} ${className}`}></div>
  );
}

// A full Skeleton Card layout matching real liquid glass resume card structure
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm flex flex-col gap-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-(--surface-soft) rounded-lg w-3/4" />
          <div className="h-3 bg-(--surface-soft) rounded-lg w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="rounded-xl bg-(--surface-soft)/50 border border-(--hairline-soft) p-3 text-center">
          <div className="h-2.5 bg-(--surface-soft) rounded w-12 mx-auto mb-2" />
          <div className="h-6 bg-(--surface-soft) rounded-lg w-8 mx-auto" />
        </div>
        <div className="rounded-xl bg-(--surface-soft)/50 border border-(--hairline-soft) p-3 text-center">
          <div className="h-2.5 bg-(--surface-soft) rounded w-14 mx-auto mb-2" />
          <div className="h-6 bg-(--surface-soft) rounded-lg w-8 mx-auto" />
        </div>
      </div>
      <div className="h-9 bg-(--surface-soft) rounded-xl mt-1" />
    </div>
  );
}

// Skeleton for history panel items — matches HistoryPanel item structure
export function SkeletonHistoryItem({ className = "" }) {
  return (
    <div className={`rounded-xl border border-(--hairline) bg-(--surface-card) p-3.5 shadow-xs animate-pulse space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 bg-(--surface-soft) rounded" />
        <div className="h-2.5 bg-(--surface-soft) rounded w-1/3" />
      </div>
      <div className="h-3.5 bg-(--surface-soft) rounded-lg w-4/5" />
      <div className="h-2.5 bg-(--surface-soft) rounded-lg w-1/2" />
    </div>
  );
}

// A full-page Skeleton loader layout
export function SkeletonPage() {
  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-9 bg-(--surface-soft) rounded-xl w-1/3" />
        <div className="h-4 bg-(--surface-soft) rounded-lg w-1/4" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonBlock height="h-64" />
        <SkeletonCard />
      </div>
    </div>
  );
}
