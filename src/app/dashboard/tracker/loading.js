"use client";

// Tracker page skeleton — matches the real Kanban board layout:
// Header with title + button → 5 Kanban columns with card skeletons
const COLUMNS = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];
const COL_COLORS = {
  'SAVED': 'bg-brutal-bg', 'APPLIED': 'bg-brutal-yellow',
  'INTERVIEWING': 'bg-brutal-blue', 'OFFER': 'bg-brutal-green', 'REJECTED': 'bg-brutal-pink'
};

export default function TrackerLoading() {
  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-72 mb-3" />
          <div className="h-7 bg-brutal-yellow border-2 border-brutal-black shadow-[2px_2px_0_#000] rounded w-80 px-3 py-1" />
        </div>
        <div className="h-12 bg-brutal-blue border-2 border-brutal-black shadow-[4px_4px_0_#000] rounded w-44" />
      </div>

      {/* Kanban columns */}
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
        {COLUMNS.map(col => (
          <div key={col} className={`min-w-[320px] max-w-[320px] border-4 border-brutal-black flex-1 flex flex-col snap-center ${COL_COLORS[col]} shadow-[4px_4px_0_rgba(0,0,0,1)]`}>
            <div className="p-4 border-b-4 border-brutal-black bg-white flex justify-between items-center">
              <span className="text-xl font-black uppercase tracking-tight opacity-30">{col}</span>
              <span className="text-sm font-black bg-black text-white px-2 py-0.5">—</span>
            </div>
            <div className="p-4 flex-1 space-y-4 bg-white/40 min-h-[400px]">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border-2 border-gray-200 p-4 space-y-3">
                  <div className="h-5 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
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
