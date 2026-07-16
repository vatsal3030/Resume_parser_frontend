"use client";

// Analyze page skeleton — matches the real upload layout:
// ToolPageLayout header → Upload dropzone card → Model selector → Submit button
export default function AnalyzeLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* PageShell header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-56 mb-3" />
          <div className="h-6 bg-brutal-mint rounded w-80" />
        </div>
        <div className="h-10 bg-brutal-yellow border-2 border-brutal-black rounded w-36" />
      </div>

      {/* Upload card */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 md:p-12">
          {/* Section label */}
          <div className="h-5 bg-gray-300 rounded w-48 mb-6" />

          {/* Dropzone area */}
          <div className="border-4 border-dashed border-brutal-black bg-brutal-bg p-16 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded" />
            <div className="h-6 bg-gray-300 rounded w-56" />
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-100 rounded w-24 mt-1" />
          </div>

          {/* Model selector skeleton */}
          <div className="mt-8">
            <div className="h-5 bg-gray-300 rounded w-36 mb-3" />
            <div className="h-12 bg-gray-100 border-2 border-gray-200 rounded" />
          </div>

          {/* Submit button skeleton */}
          <div className="h-14 bg-brutal-green/30 border-2 border-brutal-black rounded w-full mt-8" />
        </div>
      </div>
    </div>
  );
}
