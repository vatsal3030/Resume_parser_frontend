"use client";

// Analyze page skeleton — matches the real upload layout:
// ToolPageLayout header → Upload dropzone card → Model selector → Submit button
export default function AnalyzeLoading() {
 return (
 <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
 {/* PageShell header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-(--hairline) pb-6 gap-4">
 <div>
 <div className="h-10 bg-(--surface-soft) rounded w-56 mb-3" />
 <div className="h-6 bg-(--surface-soft) rounded w-80" />
 </div>
 <div className="h-10 bg-(--surface-soft) border border-(--hairline) rounded w-36" />
 </div>

 {/* Upload card */}
 <div className="max-w-7xl mx-auto">
 <div className="bg-(--surface-card) border border-(--hairline) shadow-md p-8 md:p-12">
 {/* Section label */}
 <div className="h-5 bg-(--surface-soft) rounded w-48 mb-6" />

 {/* Dropzone area */}
 <div className="border border-dashed border-(--hairline) bg-(--canvas) p-16 flex flex-col items-center gap-4">
 <div className="w-16 h-16 bg-(--surface-soft) rounded" />
 <div className="h-6 bg-(--surface-soft) rounded w-56" />
 <div className="h-4 bg-(--surface-soft) rounded w-32" />
 <div className="h-3 bg-(--surface-soft) rounded w-24 mt-1" />
 </div>

 {/* Model selector skeleton */}
 <div className="mt-8">
 <div className="h-5 bg-(--surface-soft) rounded w-36 mb-3" />
 <div className="h-12 bg-(--surface-soft) border border-(--hairline-soft) rounded" />
 </div>

 {/* Submit button skeleton */}
 <div className="h-14 bg-(--success)/30 border border-(--hairline) rounded w-full mt-8" />
 </div>
 </div>
 </div>
 );
}
