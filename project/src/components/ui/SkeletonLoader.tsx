function SkeletonBox({ className }: { className: string }) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg ${className}`} />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-32 rounded" />
          <SkeletonBox className="h-3 w-24 rounded" />
        </div>
        <SkeletonBox className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBox className="w-full h-52" />
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-5 w-3/4 rounded" />
        <SkeletonBox className="h-4 w-full rounded" />
        <SkeletonBox className="h-4 w-5/6 rounded" />
        <div className="flex gap-4 pt-2">
          <SkeletonBox className="h-8 w-20 rounded-full" />
          <SkeletonBox className="h-8 w-20 rounded-full" />
          <SkeletonBox className="h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 animate-pulse">
      <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-4 w-3/4 rounded" />
        <SkeletonBox className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function ClubCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-28 rounded" />
          <SkeletonBox className="h-3 w-20 rounded" />
        </div>
      </div>
      <SkeletonBox className="h-3 w-full rounded" />
      <SkeletonBox className="h-3 w-5/6 rounded" />
      <SkeletonBox className="h-8 w-24 rounded-full" />
    </div>
  );
}
