"use client";

// Studio page skeleton — matches the real resume list layout:
// Header with"Resume Studio" title, yellow subtitle, +"New Resume" button → Grid of resume card skeletons
export default function StudioLoading() {
 return (
 <div className="min-h-screen p-8 max-w-5xl mx-auto animate-pulse">
 {/* Header — matches the real header layout */}
 <div className="flex items-center justify-between mb-8 border-b border-(--hairline) pb-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-56 mb-2" />
 <div className="h-7 bg-(--surface-soft) border border-(--hairline) px-2 inline-block w-64" />
 </div>
 <div className="h-10 bg-(--surface-soft) border border-(--hairline) shadow-sm rounded w-36" />
 </div>

 {/* Resume cards grid — matches the 3-column card layout */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3].map(i => (
 <div key={i} className="bg-(--surface-card) border border-(--hairline) p-5 shadow-sm">
 <div className="h-6 bg-(--surface-soft) rounded w-3/4 mb-3" />
 <div className="h-4 bg-(--surface-soft) rounded w-1/2 mb-2" />
 <div className="h-3 bg-(--surface-soft) rounded w-1/3 mt-4" />
 </div>
 ))}
 </div>
 </div>
 );
}
