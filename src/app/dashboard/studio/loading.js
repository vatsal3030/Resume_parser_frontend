"use client";

// Studio page skeleton — matches the real resume list layout:
// Header with "Resume Studio" title, yellow subtitle, + "New Resume" button → Grid of resume card skeletons
export default function StudioLoading() {
  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto animate-pulse">
      {/* Header — matches the real header layout */}
      <div className="flex items-center justify-between mb-8 border-b-4 border-brutal-black pb-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-56 mb-2" />
          <div className="h-7 bg-brutal-yellow border-2 border-brutal-black px-2 inline-block w-64" />
        </div>
        <div className="h-10 bg-brutal-mint border-2 border-brutal-black shadow-brutal-sm rounded w-36" />
      </div>

      {/* Resume cards grid — matches the 3-column card layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border-4 border-brutal-black p-5 shadow-brutal">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/3 mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
