"use client";

// Profile page skeleton — matches the real profile page layout:
// PageShell header → BrutalTabs → White card with Account tab content
export default function ProfileLoading() {
 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-48 mb-3" />
 <div className="h-6 bg-(--surface-soft) rounded w-56" />
 </div>
 <div className="h-10 bg-(--surface-soft) border border-(--hairline) rounded w-32" />
 </div>

 {/* BrutalTabs bar */}
 <div className="flex flex-wrap gap-2 border-b border-(--hairline) pb-3 mb-6">
 {['Account', 'Personal', 'Career', 'Education', 'Links', 'Achievements'].map((label, i) => (
 <div key={i} className={`px-4 py-2 border border-(--hairline) text-xs font-medium ${i === 0 ? 'bg-(--surface-soft) shadow-sm' : 'bg-(--surface-soft)'}`}>
 {label}
 </div>
 ))}
 </div>

 {/* Content card */}
 <div className="bg-(--surface-card) border border-(--hairline) p-6 shadow-sm">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Left: Avatar */}
 <div>
 <div className="h-5 bg-(--surface-soft) rounded w-32 mb-4" />
 <div className="flex items-center gap-6 mt-4">
 <div className="w-24 h-24 bg-(--surface-soft) border border-(--hairline-soft) shrink-0" />
 <div className="space-y-2">
 <div className="h-9 bg-(--surface-soft) border border-(--hairline-soft) rounded w-28" />
 <div className="h-3 bg-(--surface-soft) rounded w-24" />
 </div>
 </div>
 <div className="mt-6">
 <div className="h-3 bg-(--surface-soft) rounded w-28 mb-2" />
 <div className="flex gap-2">
 {[1,2,3,4,5,6].map(i => <div key={i} className="w-12 h-12 bg-(--surface-soft) border border-(--hairline-soft)" />)}
 </div>
 </div>
 </div>
 {/* Right: Password */}
 <div>
 <div className="h-5 bg-(--surface-soft) rounded w-24 mb-4" />
 <div className="space-y-4 mt-4">
 <div><div className="h-3 bg-(--surface-soft) rounded w-28 mb-2" /><div className="h-10 bg-(--surface-soft) border border-(--hairline-soft)" /></div>
 <div><div className="h-3 bg-(--surface-soft) rounded w-32 mb-2" /><div className="h-10 bg-(--surface-soft) border border-(--hairline-soft)" /></div>
 </div>
 </div>
 {/* Bottom */}
 <div className="md:col-span-2 border-t border-(--hairline-soft) pt-6 mt-2">
 <div className="h-5 bg-(--surface-soft) rounded w-44 mb-4" />
 <div className="h-4 bg-(--surface-soft) rounded w-full max-w-md mb-4" />
 <div className="h-10 bg-(--surface-soft) border border-(--hairline-soft) rounded w-48" />
 </div>
 </div>
 </div>
 </div>
 );
}
