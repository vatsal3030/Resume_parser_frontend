"use client";

// Dashboard overview skeleton — Claude Liquid Glass aesthetic
export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-(--hairline) pb-6">
        <div>
          <div className="h-8 bg-(--surface-soft) rounded-xl w-40 mb-2" />
          <div className="h-4 bg-(--surface-soft) rounded-lg w-64" />
        </div>
        <div className="flex gap-2.5">
          <div className="h-9 bg-(--surface-soft) rounded-xl w-32" />
          <div className="h-9 bg-(--surface-soft) rounded-xl w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Activity section */}
          <section>
            <div className="h-5 bg-(--surface-soft) rounded-lg w-24 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-3 bg-(--surface-soft) rounded w-16" />
                    <div className="w-8 h-8 rounded-xl bg-(--surface-soft)" />
                  </div>
                  <div className="h-8 bg-(--surface-soft) rounded-lg w-20 mb-2" />
                  <div className="h-3 bg-(--surface-soft) rounded w-28" />
                </div>
              ))}
            </div>
          </section>

          {/* Analytics section */}
          <section>
            <div className="h-5 bg-(--surface-soft) rounded-lg w-24 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-sm h-72">
                  <div className="h-4 bg-(--surface-soft) rounded w-32 mb-4" />
                  <div className="h-48 bg-(--surface-soft) rounded-xl" />
                </div>
              ))}
            </div>
          </section>

          {/* Recent Resumes */}
          <section>
            <div className="h-5 bg-(--surface-soft) rounded-lg w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-(--surface-soft)" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-(--surface-soft) rounded w-32" />
                      <div className="h-3 bg-(--surface-soft) rounded w-20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-(--surface-soft) rounded-xl" />
                    <div className="h-16 bg-(--surface-soft) rounded-xl" />
                  </div>
                  <div className="h-9 bg-(--surface-soft) rounded-xl" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm h-48 space-y-3">
            <div className="h-4 bg-(--surface-soft) rounded w-24" />
            <div className="h-6 bg-(--surface-soft) rounded w-3/4" />
            <div className="h-2 bg-(--surface-soft) rounded-full w-full mt-4" />
            <div className="h-8 bg-(--surface-soft) rounded-xl w-36 mt-4" />
          </div>
          <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm space-y-3">
            <div className="h-5 bg-(--surface-soft) rounded w-28 mb-4" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)/50">
                <div className="w-8 h-8 rounded-lg bg-(--surface-soft)" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-(--surface-soft) rounded w-3/4" />
                  <div className="h-2 bg-(--surface-soft) rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Tools grid */}
      <section className="pt-4">
        <div className="h-5 bg-(--surface-soft) rounded-lg w-28 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm h-32 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-(--surface-soft)" />
              <div className="h-4 bg-(--surface-soft) rounded w-24" />
              <div className="h-3 bg-(--surface-soft) rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
