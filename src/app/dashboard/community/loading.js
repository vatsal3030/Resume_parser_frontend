"use client";

// Community page skeleton — matches the real community layout:
// Header → Search/filter bar → Grid of post cards with avatar, title, tags, stats
export default function CommunityLoading() {
 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-56 mb-3" />
 <div className="h-6 bg-(--surface-soft) rounded w-64" />
 </div>
 <div className="h-10 bg-(--surface-soft) border border-(--hairline) rounded w-36" />
 </div>

 {/* Search bar */}
 <div className="bg-(--surface-card) border border-(--hairline) p-4 mb-8 shadow-sm">
 <div className="h-10 bg-(--surface-soft) border border-(--hairline-soft) rounded w-full" />
 </div>

 {/* Post cards grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map(i => (
 <div key={i} className="bg-(--surface-card) border border-(--hairline) p-5 shadow-sm">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-(--surface-soft) rounded-full shrink-0" />
 <div className="flex-1">
 <div className="h-4 bg-(--surface-soft) rounded w-24 mb-1" />
 <div className="h-3 bg-(--surface-soft) rounded w-16" />
 </div>
 </div>
 <div className="h-5 bg-(--surface-soft) rounded w-4/5 mb-3" />
 <div className="space-y-2 mb-4">
 <div className="h-3 bg-(--surface-soft) rounded w-full" />
 <div className="h-3 bg-(--surface-soft) rounded w-3/4" />
 </div>
 <div className="flex gap-2 mb-4">
 <div className="h-5 bg-(--surface-soft) border border-(--hairline-soft) rounded w-14" />
 <div className="h-5 bg-(--surface-soft) border border-(--hairline-soft) rounded w-18" />
 </div>
 <div className="flex justify-between items-center pt-3 border-t border-gray-100">
 <div className="h-4 bg-(--surface-soft) rounded w-12" />
 <div className="h-4 bg-(--surface-soft) rounded w-16" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
