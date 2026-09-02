"use client";

// Help page skeleton — matches the real help page layout:
// Yellow banner → Navigation tabs bar → White content card with accordion items
export default function HelpLoading() {
 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header skeleton */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-64 mb-3" />
 <div className="h-6 bg-(--surface-soft) rounded w-72" />
 </div>
 </div>

 <div className="max-w-5xl mx-auto">
 {/* Yellow intro banner skeleton */}
 <div className="bg-(--surface-soft) border border-(--hairline) p-8 shadow-md mb-8">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-8 h-8 bg-(--surface-soft)/40 rounded" />
 <div className="h-8 bg-(--surface-soft)/30 rounded w-64" />
 </div>
 <div className="space-y-2">
 <div className="h-4 bg-(--surface-soft)/20 rounded w-full" />
 <div className="h-4 bg-(--surface-soft)/20 rounded w-4/5" />
 </div>
 </div>

 {/* Navigation tabs skeleton — matches the real tab bar */}
 <div className="flex flex-wrap gap-2 mb-8 p-3 bg-(--surface-card) border border-(--hairline)">
 {['Getting Started', 'Dashboard', 'Tools Reference', 'Account & Billing', 'AI Copilot', 'Shortcuts', 'Troubleshooting', 'Support'].map((label, i) => (
 <div key={i} className={`flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-wide border ${i === 0 ? 'bg-(--surface-soft) border-(--hairline) shadow-sm' : 'border-transparent bg-gray-50'}`}>
 <div className="w-4 h-4 bg-(--surface-soft) rounded" />
 {label}
 </div>
 ))}
 </div>

 {/* Content card skeleton — matches accordion items */}
 <div className="bg-(--surface-card) border border-(--hairline) p-6 md:p-8 shadow-sm">
 <div className="h-7 bg-(--surface-soft) rounded w-48 mb-6 border-b border-(--hairline-soft) pb-2" />
 <div className="space-y-3">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className="border-b border-(--hairline-soft) py-4">
 <div className="h-5 bg-(--surface-soft) rounded w-3/5" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
