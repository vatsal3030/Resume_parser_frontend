"use client";

// Tracker page skeleton — matches the real Kanban board layout:
// Header with title + button → 5 Kanban columns with card skeletons
const COLUMNS = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];
const COL_COLORS = {
 'SAVED': 'bg-(--canvas)', 'APPLIED': 'bg-(--surface-soft)',
 'INTERVIEWING': 'bg-(--surface-soft)', 'OFFER': 'bg-(--success)', 'REJECTED': 'bg-(--surface-soft)'
};

export default function TrackerLoading() {
 return (
 <div className="min-h-screen p-8 max-w-7xl mx-auto animate-pulse">
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-72 mb-3" />
 <div className="h-7 bg-(--surface-soft) border border-(--hairline) shadow-sm rounded w-80 px-3 py-1" />
 </div>
 <div className="h-12 bg-(--surface-soft) border border-(--hairline) shadow-sm rounded w-44" />
 </div>

 {/* Kanban columns */}
 <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
 {COLUMNS.map(col => (
 <div key={col} className={`min-w-[320px] max-w-[320px] border border-(--hairline) flex-1 flex flex-col snap-center ${COL_COLORS[col]} shadow-sm`}>
 <div className="p-4 border-b border-(--hairline) bg-(--surface-card) flex justify-between items-center">
 <span className="text-xl font-medium opacity-30">{col}</span>
 <span className="text-sm font-semibold bg-black text-white px-2 py-0.5">—</span>
 </div>
 <div className="p-4 flex-1 space-y-4 bg-(--surface-card)/40 min-h-[400px]">
 {[1, 2].map(i => (
 <div key={i} className="bg-(--surface-card) border border-(--hairline-soft) p-4 space-y-3">
 <div className="h-5 bg-(--surface-soft) rounded w-3/4" />
 <div className="h-4 bg-(--surface-soft) rounded w-1/2" />
 <div className="flex justify-between items-center pt-2">
 <div className="h-3 bg-(--surface-soft) rounded w-20" />
 <div className="h-3 bg-(--surface-soft) rounded w-16" />
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
