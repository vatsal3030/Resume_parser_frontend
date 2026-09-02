"use client";

// Generic tool page skeleton — matches ToolPageLayout:
// PageShell header with"View History" button → Compact input card (4-col grid: resume select, text input, model selector, submit button) → Empty state placeholder
export default function ToolLoading() {
 return (
 <div className="flex h-full relative overflow-hidden">
 {/* Main Content area — matches ToolPageLayout flex-1 */}
 <div className="flex-1 min-w-0 overflow-y-auto">
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-52 mb-3" />
 <div className="h-6 bg-(--surface-soft) rounded w-72" />
 </div>
 <div className="flex items-center gap-2">
 <div className="h-10 bg-(--surface-soft) border border-(--hairline) shadow-sm rounded w-36" />
 </div>
 </div>

 {/* Compact input bar — matches Card with 4-col grid */}
 <div className="bg-(--surface-card) border border-(--hairline) shadow-sm mb-6">
 <div className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
 {/* Resume select */}
 <div>
 <div className="h-3 bg-(--surface-soft) rounded w-28 mb-2" />
 <div className="h-10 bg-(--surface-soft) border border-(--hairline)" />
 </div>
 {/* Text input */}
 <div>
 <div className="h-3 bg-(--surface-soft) rounded w-32 mb-2" />
 <div className="h-10 bg-(--surface-soft) border border-(--hairline)" />
 </div>
 {/* Model selector (compact) */}
 <div>
 <div className="h-3 bg-(--surface-soft) rounded w-20 mb-2" />
 <div className="h-10 bg-(--surface-soft) border border-(--hairline)" />
 </div>
 {/* Submit button */}
 <div>
 <div className="h-10 bg-(--surface-soft)/40 border border-(--hairline)" />
 </div>
 </div>
 </div>
 </div>

 {/* Empty state placeholder */}
 <div className="border border-dashed border-(--hairline) flex items-center justify-center p-12 text-center opacity-30">
 <div className="h-5 bg-(--surface-soft) rounded w-72" />
 </div>
 </div>
 </div>
 </div>
 );
}
