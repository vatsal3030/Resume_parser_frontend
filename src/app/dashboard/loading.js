"use client";

// Dashboard overview skeleton — matches the real layout:
// Header with 2 buttons → 3-column grid (left: metrics + charts + resumes, right: sidebar)
// → Core tools grid at bottom
export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-40 mb-3" />
          <div className="h-5 bg-gray-200 rounded w-72" />
        </div>
        <div className="flex gap-4">
          <div className="h-11 bg-brutal-blue border-2 border-brutal-black rounded w-40" />
          <div className="h-11 bg-brutal-mint border-2 border-brutal-black rounded w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Activity section header */}
          <section>
            <div className="h-5 bg-gray-300 rounded w-24 mb-4 flex items-center gap-2" />
            {/* 2x2 Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { color: 'bg-brutal-mint' },
                { color: 'bg-brutal-yellow' },
                { color: 'bg-brutal-pink' },
                { color: 'bg-brutal-blue' }
              ].map((card, i) => (
                <div key={i} className={`${card.color} border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000]`}>
                  <div className="h-3 bg-black/10 rounded w-20 mb-3" />
                  <div className="h-10 bg-black/10 rounded w-16 mb-1" />
                  <div className="h-3 bg-black/5 rounded w-28" />
                </div>
              ))}
            </div>
          </section>

          {/* Analytics section */}
          <section>
            <div className="h-5 bg-gray-300 rounded w-28 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000] h-48">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-4" />
                  <div className="h-24 bg-gray-100 border-2 border-gray-200 rounded" />
                </div>
              ))}
            </div>
          </section>

          {/* Recent Resumes */}
          <section>
            <div className="h-5 bg-gray-300 rounded w-36 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => (
                <div key={i} className="bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-brutal-blue border-3 border-brutal-black" />
                    <div>
                      <div className="h-5 bg-gray-300 rounded w-32 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-brutal-bg border-3 border-brutal-black p-4 text-center">
                      <div className="h-3 bg-gray-300 rounded w-16 mx-auto mb-2" />
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
                    </div>
                    <div className="bg-brutal-yellow border-3 border-brutal-black p-4 text-center">
                      <div className="h-3 bg-gray-300 rounded w-14 mx-auto mb-2" />
                      <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
                    </div>
                  </div>
                  <div className="h-10 bg-gray-100 border-3 border-gray-200 rounded" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-8">
          <div className="bg-white border-4 border-brutal-black p-5 shadow-brutal h-32">
            <div className="h-4 bg-gray-300 rounded w-32 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-full mb-2" />
            <div className="h-8 bg-gray-200 border-2 border-gray-300 rounded w-28 mt-3" />
          </div>
          <div className="bg-white border-4 border-brutal-black p-5 shadow-brutal">
            <div className="h-4 bg-gray-300 rounded w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Core Tools grid */}
      <section>
        <div className="h-5 bg-gray-300 rounded w-28 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            'bg-brutal-blue', 'bg-brutal-mint', 'bg-black', 'bg-brutal-bg',
            'bg-brutal-yellow', 'bg-brutal-blue', 'bg-brutal-pink', 'bg-brutal-green'
          ].map((bg, i) => (
            <div key={i} className={`${bg} border-4 border-brutal-black p-5 shadow-[4px_4px_0_#000] h-24`}>
              <div className="h-4 bg-black/10 rounded w-28 mb-2" />
              <div className="h-3 bg-black/5 rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
