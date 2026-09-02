"use client";

// Trash page skeleton — matches the real trash page layout:
// PageShell header → Grouped items with tool type headers and item rows
export default function TrashLoading() {
 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-32 mb-3" />
 <div className="h-6 bg-red-200 rounded w-72" />
 </div>
 </div>

 {/* Grouped items skeleton */}
 <div className="space-y-8">
 {[{ label: 'Resume Analysis', count: 2 }, { label: 'Tailoring', count: 1 }].map((group, gi) => (
 <div key={gi}>
 <div className="flex items-center gap-2 mb-3">
 <div className="w-5 h-5 bg-(--surface-soft) rounded" />
 <span className="font-medium text-sm opacity-30">{group.label}</span>
 <div className="h-5 bg-(--surface-soft) border border-(--hairline-soft) rounded w-6 text-center text-[10px] font-bold text-gray-400">{group.count}</div>
 </div>
 <div className="space-y-2">
 {Array.from({ length: group.count }).map((_, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-(--surface-card) border border-(--hairline) shadow-sm">
 <div className="flex-1 min-w-0">
 <div className="h-4 bg-(--surface-soft) rounded w-3/5 mb-2" />
 <div className="flex items-center gap-3">
 <div className="h-3 bg-(--surface-soft) rounded w-24" />
 <div className="h-3 bg-(--surface-soft) rounded w-20" />
 </div>
 </div>
 <div className="flex items-center gap-2 ml-4">
 <div className="h-8 bg-(--surface-soft) border border-(--hairline-soft) rounded w-20" />
 <div className="h-8 bg-(--surface-soft) border border-(--hairline-soft) rounded w-8" />
 </div>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
