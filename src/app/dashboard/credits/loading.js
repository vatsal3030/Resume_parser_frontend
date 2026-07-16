"use client";

// Credits page skeleton — matches the real pricing cards layout:
// Header → Stats card → 3 pricing plan cards
export default function CreditsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* PageShell header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <div className="h-10 bg-gray-300 rounded w-48 mb-3" />
          <div className="h-6 bg-brutal-yellow rounded w-64" />
        </div>
      </div>

      {/* Current balance card */}
      <div className="bg-white border-4 border-brutal-black p-6 shadow-brutal mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
            <div className="h-10 bg-gray-300 rounded w-20" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { color: 'bg-brutal-blue' },
          { color: 'bg-brutal-yellow' },
          { color: 'bg-brutal-mint' }
        ].map((plan, i) => (
          <div key={i} className="border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white">
            <div className={`p-6 ${plan.color} border-b-4 border-brutal-black`}>
              <div className="h-6 bg-black/10 rounded w-20 mb-2" />
              <div className="h-10 bg-black/10 rounded w-24 mb-1" />
              <div className="h-3 bg-black/5 rounded w-16" />
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
              <div className="h-12 bg-gray-200 border-2 border-gray-300 rounded w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
