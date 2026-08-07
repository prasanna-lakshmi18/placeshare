export function ExperienceCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/6 animate-pulse" />
        </div>
      </div>

      {/* Badges Skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-24 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-24 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-16 animate-pulse" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20 animate-pulse" />
      </div>

      {/* Body Skeleton */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-16 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-16 animate-pulse" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="flex space-x-3 mt-4">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-12 animate-pulse" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  );
}
