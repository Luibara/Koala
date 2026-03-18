function Shimmer({ className }: { className: string }) {
  return <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />;
}

export default function CompanyDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Shimmer className="h-4 w-24 mb-4" />
          <div className="flex items-start gap-4">
            <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-7 w-2/3" />
              <Shimmer className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-3">
                <Shimmer className="h-4 w-1/2" />
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-3/4" />
                <Shimmer className="h-3 w-2/3" />
              </div>
            ))}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
                <Shimmer className="h-5 w-1/3" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex gap-4">
                      <Shimmer className="h-4 w-1/4" />
                      <Shimmer className="h-4 w-1/4" />
                      <Shimmer className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
