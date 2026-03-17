export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
