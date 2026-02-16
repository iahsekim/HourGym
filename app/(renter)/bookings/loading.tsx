import { Skeleton, BookingCardSkeleton } from '@/components/ui';

export default function BookingsLoading() {
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-40 sm:h-9" />
          <Skeleton className="mt-2 h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
