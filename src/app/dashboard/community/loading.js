"use client";

// Community page skeleton — matches the real community layout:
// Header → Search/filter bar → Grid of post cards with avatar, title, tags, stats
export default function CommunityLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* PageShell header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-56 mb-3" />
          <div className="h-6 bg-brutal-mint rounded w-64" />
        </div>
        <div className="h-10 bg-brutal-yellow border-2 border-brutal-black rounded w-36" />
      </div>

      {/* Search bar */}
      <div className="bg-white border-4 border-brutal-black p-4 mb-8 shadow-[4px_4px_0_#000]">
        <div className="h-10 bg-gray-100 border-2 border-gray-200 rounded w-full" />
      </div>

      {/* Post cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white border-4 border-brutal-black p-5 shadow-[4px_4px_0_#000]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <div className="h-5 bg-gray-300 rounded w-4/5 mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-gray-100 border border-gray-200 rounded w-14" />
              <div className="h-5 bg-gray-100 border border-gray-200 rounded w-18" />
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
