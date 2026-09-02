"use client";

// Credits page skeleton — matches the real pricing cards layout:
// Header → Stats card → 3 pricing plan cards
export default function CreditsLoading() {
 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-48 mb-3" />
 <div className="h-6 bg-(--surface-soft) rounded w-64" />
 </div>
 </div>

 {/* Current balance card */}
 <div className="bg-(--surface-card) border border-(--hairline) p-6 shadow-sm mb-8">
 <div className="flex items-center justify-between">
 <div>
 <div className="h-4 bg-(--surface-soft) rounded w-28 mb-2" />
 <div className="h-10 bg-(--surface-soft) rounded w-20" />
 </div>
 <div className="h-4 bg-(--surface-soft) rounded w-32" />
 </div>
 </div>

 {/* Pricing cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {[
 { color: 'bg-(--surface-soft)' },
 { color: 'bg-(--surface-soft)' },
 { color: 'bg-(--surface-soft)' }
 ].map((plan, i) => (
 <div key={i} className="border border-(--hairline) shadow-sm bg-(--surface-card)">
 <div className={`p-6 ${plan.color} border-b border-(--hairline)`}>
 <div className="h-6 bg-black/10 rounded w-20 mb-2" />
 <div className="h-10 bg-black/10 rounded w-24 mb-1" />
 <div className="h-3 bg-black/5 rounded w-16" />
 </div>
 <div className="p-6 space-y-3">
 {[1, 2, 3, 4].map(j => (
 <div key={j} className="flex items-center gap-2">
 <div className="w-4 h-4 bg-(--surface-soft) rounded" />
 <div className="h-4 bg-(--surface-soft) rounded w-3/4" />
 </div>
 ))}
 <div className="h-12 bg-(--surface-soft) border border-(--hairline-soft) rounded w-full mt-4" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
