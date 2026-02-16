import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { BookingForm } from '@/components/booking/booking-form';
import { formatCents } from '@/lib/utils';
import {
  MapPin,
  Users,
  Maximize,
  Clock,
  Shield,
  Info,
  ArrowLeft,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PageProps {
  params: { id: string };
}

const spaceTypeLabels: Record<string, string> = {
  mats: 'Training Mats',
  turf: 'Turf Area',
  cage: 'Cage/Ring',
  studio: 'Studio',
  other: 'Other',
};

const cancellationPolicyDescriptions: Record<string, string> = {
  flexible: 'Full refund if cancelled 24+ hours before the booking',
  moderate: 'Full refund if cancelled 48+ hours before the booking',
  strict: 'Full refund if cancelled 7+ days before the booking',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();

  const { data: space } = await supabase
    .from('spaces')
    .select('name, gym:gyms(name)')
    .eq('id', params.id)
    .single();

  if (!space) {
    return { title: 'Space Not Found' };
  }

  return {
    title: `${space.name} at ${(space.gym as any).name}`,
    description: `Book ${space.name} at ${(space.gym as any).name} by the hour. Perfect for personal training sessions.`,
  };
}

export default async function SpaceDetailPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: space, error } = await supabase
    .from('spaces')
    .select(
      `
      *,
      gym:gyms(*),
      photos:space_photos(*)
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !space) {
    notFound();
  }

  const gym = space.gym as any;
  const photos = (space.photos as any[])?.sort((a, b) => a.position - b.position) || [];

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      {/* Back link */}
      <Link
        href="/spaces"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to all spaces
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Space details */}
        <div className="lg:col-span-2">
          {/* Photo gallery */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
            {photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photos[0].url}
                alt={space.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Dumbbell className="h-16 w-16 text-gray-300" />
              </div>
            )}
            <Badge className="absolute right-4 top-4 bg-white">
              {spaceTypeLabels[space.type]}
            </Badge>
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {photos.slice(1, 5).map((photo, index) => (
                <div
                  key={photo.id}
                  className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-28"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`${space.name} photo ${index + 2}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
              {photos.length > 5 && (
                <div className="flex h-20 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500 sm:h-24 sm:w-28">
                  +{photos.length - 5} more
                </div>
              )}
            </div>
          )}

          {/* Space info */}
          <div className="mt-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{space.name}</h1>
            <p className="mt-2 text-lg text-gray-600">{gym.name}</p>

            {/* Location */}
            <div className="mt-4 flex items-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>{gym.address || gym.city || 'Denver, CO'}</span>
            </div>

            {/* Quick stats */}
            <div className="mt-6 flex flex-wrap gap-4">
              {space.capacity && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">Up to {space.capacity} people</span>
                </div>
              )}
              {space.square_feet && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
                  <Maximize className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{space.square_feet} sq ft</span>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Instant booking</span>
              </div>
            </div>

            {/* Description */}
            {space.description && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">About this space</h2>
                <p className="mt-3 whitespace-pre-wrap text-gray-600">{space.description}</p>
              </div>
            )}

            {/* Entry instructions */}
            {space.entry_instructions && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900">Entry Instructions</h2>
                <div className="mt-3 rounded-lg border bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-sm text-blue-800">{space.entry_instructions}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation policy */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">Cancellation Policy</h2>
              <div className="mt-3 flex items-start gap-3">
                <Shield className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <p className="font-medium capitalize text-gray-900">
                    {gym.cancellation_policy}
                  </p>
                  <p className="text-sm text-gray-600">
                    {cancellationPolicyDescriptions[gym.cancellation_policy]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Booking card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl">{formatCents(space.hourly_rate)}</CardTitle>
                <span className="text-gray-500">per hour</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {user ? (
                <BookingForm
                  spaceId={space.id}
                  hourlyRate={space.hourly_rate}
                  gymOwnerId={gym.owner_id}
                  userId={user.id}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    Sign in to book this space
                  </p>
                  <Link href={`/login?redirect=/spaces/${space.id}`}>
                    <Button className="w-full">Sign In to Book</Button>
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-brand-600 hover:underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform fee notice */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Includes platform fee. No hidden charges.
          </p>
        </div>
      </div>
    </div>
  );
}
