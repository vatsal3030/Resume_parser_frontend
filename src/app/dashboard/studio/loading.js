"use client";

// Studio page skeleton — matches the real resume list layout:
// Header with buttons → Grid of resume cards
export default function StudioLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-56 mb-3" />
          <div className="h-6 bg-brutal-yellow rounded w-72" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-brutal-blue border-2 border-brutal-black rounded w-36" />
          <div className="h-10 bg-gray-200 border-2 border-brutal-black rounded w-32" />
        </div>
      </div>

      {/* Resume cards grid */}
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
