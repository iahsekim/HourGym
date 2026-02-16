import { Skeleton, SpaceCardSkeleton } from '@/components/ui';

export default function SpacesLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48 sm:h-9" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* Results */}
      <div className="mt-8">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SpaceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
