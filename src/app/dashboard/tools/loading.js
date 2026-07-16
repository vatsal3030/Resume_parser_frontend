"use client";

// Tool page skeleton — matches the stacked layout:
// PageShell header → compact input bar → empty state placeholder
export default function ToolLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* PageShell header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-48 mb-3" />
          <div className="h-6 bg-brutal-yellow rounded w-64" />
        </div>
        <div className="h-10 bg-gray-200 border-2 border-brutal-black rounded w-32" />
      </div>

      {/* Compact input bar */}
      <div className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-100 border-2 border-gray-200" />
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-10 bg-gray-100 border-2 border-gray-200" />
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-10 bg-gray-100 border-2 border-gray-200" />
          </div>
          <div>
            <div className="h-10 bg-brutal-blue/30 border-2 border-brutal-black" />
          </div>
        </div>
      </div>

      {/* Empty state placeholder */}
      <div className="border-4 border-dashed border-gray-300 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 bg-gray-200 rounded mb-4" />
        <div className="h-5 bg-gray-200 rounded w-64" />
      </div>
    </div>
  );
}
