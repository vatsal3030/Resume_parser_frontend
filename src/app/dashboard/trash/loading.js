"use client";

// Trash page skeleton — matches the real trash page layout:
// PageShell header → Grouped items with tool type headers and item rows
export default function TrashLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* PageShell header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-32 mb-3" />
          <div className="h-6 bg-red-200 rounded w-72" />
        </div>
      </div>

      {/* Grouped items skeleton */}
      <div className="space-y-8">
        {[{ label: 'Resume Analysis', count: 2 }, { label: 'Tailoring', count: 1 }].map((group, gi) => (
          <div key={gi}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <span className="font-black uppercase tracking-tight text-sm opacity-30">{group.label}</span>
              <div className="h-5 bg-gray-200 border border-gray-300 rounded w-6 text-center text-[10px] font-bold text-gray-400">{group.count}</div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: group.count }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border-4 border-brutal-black shadow-brutal">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-3/5 mb-2" />
                    <div className="flex items-center gap-3">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="h-8 bg-gray-200 border-2 border-gray-300 rounded w-20" />
                    <div className="h-8 bg-gray-100 border-2 border-gray-300 rounded w-8" />
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
