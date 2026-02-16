import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, Button, Badge, EmptyState } from '@/components/ui';
import { formatCents } from '@/lib/utils';
import { MapPin, Users, Maximize, Search, Filter, Dumbbell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Browse Gym Spaces',
  description:
    'Find and book gym space by the hour in Denver. Filter by space type, price, and amenities.',
};

const spaceTypeLabels: Record<string, string> = {
  mats: 'Training Mats',
  turf: 'Turf Area',
  cage: 'Cage/Ring',
  studio: 'Studio',
  other: 'Other',
};

interface SearchParams {
  type?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function SpacesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('spaces')
    .select(
      `
      *,
      gym:gyms!inner(
        id,
        name,
        slug,
        address,
        city,
        stripe_onboarded
      ),
      photos:space_photos(url, position)
    `
    )
    .eq('is_active', true)
    .eq('gyms.stripe_onboarded', true)
    .order('created_at', { ascending: false });

  if (searchParams.type) {
    query = query.eq('type', searchParams.type);
  }

  if (searchParams.minPrice) {
    query = query.gte('hourly_rate', parseInt(searchParams.minPrice) * 100);
  }

  if (searchParams.maxPrice) {
    query = query.lte('hourly_rate', parseInt(searchParams.maxPrice) * 100);
  }

  const { data: spaces, error } = await query;

  const spaceTypes = ['mats', 'turf', 'cage', 'studio', 'other'];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Find Gym Space
          </h1>
          <p className="mt-1 text-gray-600">
            Book space by the hour in Denver
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/spaces">
          <Button
            variant={!searchParams.type ? 'default' : 'outline'}
            size="sm"
          >
            All Types
          </Button>
        </Link>
        {spaceTypes.map((type) => (
          <Link key={type} href={`/spaces?type=${type}`}>
            <Button
              variant={searchParams.type === type ? 'default' : 'outline'}
              size="sm"
            >
              {spaceTypeLabels[type]}
            </Button>
          </Link>
        ))}
      </div>

      {/* Results */}
      <div className="mt-8">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            Failed to load spaces. Please try again.
          </div>
        ) : !spaces || spaces.length === 0 ? (
          <EmptyState
            icon={<Dumbbell className="h-12 w-12" />}
            title="No spaces found"
            description={
              searchParams.type
                ? `No ${spaceTypeLabels[searchParams.type]} spaces are currently available.`
                : 'There are no gym spaces available at the moment. Check back soon!'
            }
            action={
              searchParams.type ? (
                <Link href="/spaces">
                  <Button variant="outline">
                    View All Spaces
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {spaces.length} space{spaces.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spaces.map((space: any) => {
                const primaryPhoto = space.photos?.sort(
                  (a: any, b: any) => a.position - b.position
                )[0];

                return (
                  <Link key={space.id} href={`/spaces/${space.id}`}>
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                      {/* Image */}
                      <div className="relative aspect-video bg-gray-100">
                        {primaryPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryPhoto.url}
                            alt={space.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Dumbbell className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                        <Badge className="absolute right-2 top-2 bg-white">
                          {spaceTypeLabels[space.type]}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {space.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                          {(space.gym as any).name}
                        </p>

                        {/* Location */}
                        <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {(space.gym as any).city || 'Denver'}
                          </span>
                        </div>

                        {/* Capacity & Size */}
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                          {space.capacity && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Up to {space.capacity}
                            </span>
                          )}
                          {space.square_feet && (
                            <span className="flex items-center gap-1">
                              <Maximize className="h-4 w-4" />
                              {space.square_feet} sq ft
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mt-4 flex items-baseline justify-between">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCents(space.hourly_rate)}
                          </span>
                          <span className="text-sm text-gray-500">per hour</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
