import { Skeleton, Card, CardContent, CardHeader } from '@/components/ui';

export default function SpaceDetailLoading() {
  return (
    <div>
      {/* Back link */}
      <Skeleton className="mb-6 h-4 w-32" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* Photo */}
          <Skeleton className="aspect-video w-full rounded-xl" />

          {/* Thumbnails */}
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-24 flex-shrink-0 rounded-lg sm:h-24 sm:w-28" />
            ))}
          </div>

          {/* Space info */}
          <div className="mt-8">
            <Skeleton className="h-8 w-3/4 sm:h-9" />
            <Skeleton className="mt-2 h-6 w-1/2" />

            {/* Location */}
            <Skeleton className="mt-4 h-5 w-48" />

            {/* Quick stats */}
            <div className="mt-6 flex gap-4">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>

            {/* Description */}
            <div className="mt-8 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Right column - Booking card */}
        <div>
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
