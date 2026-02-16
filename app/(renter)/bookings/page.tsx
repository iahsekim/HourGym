import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRenterBookings } from '@/actions/bookings';
import { Card, CardContent, Button, Badge, EmptyState, Tabs } from '@/components/ui';
import { formatCents, formatDate, formatTime } from '@/lib/utils';
import { Calendar, MapPin, Clock, ArrowRight, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Bookings',
  description: 'View and manage your gym space bookings.',
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/bookings');
  }

  const bookings = await getRenterBookings();

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.start_at) > now
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || new Date(b.end_at) < now
  );
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const getStatusBadge = (booking: any) => {
    if (booking.status === 'cancelled') {
      return <Badge variant="error">Cancelled</Badge>;
    }
    if (new Date(booking.end_at) < now) {
      return <Badge variant="default">Completed</Badge>;
    }
    const startDate = new Date(booking.start_at);
    if (startDate.toDateString() === now.toDateString()) {
      return <Badge variant="success">Today</Badge>;
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (startDate.toDateString() === tomorrow.toDateString()) {
      return <Badge variant="info">Tomorrow</Badge>;
    }
    return <Badge variant="success">Upcoming</Badge>;
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Bookings</h1>
          <p className="mt-1 text-gray-600">View and manage your reservations</p>
        </div>
        <Link href="/spaces">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Book a Space
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Calendar className="h-12 w-12" />}
            title="No bookings yet"
            description="You haven't made any bookings yet. Find a gym space and book your first session!"
            action={
              <Link href="/spaces">
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Browse Spaces
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Upcoming ({upcomingBookings.length})
              </h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} badge={getStatusBadge(booking)} />
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Past ({pastBookings.length})
              </h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} badge={getStatusBadge(booking)} />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Cancelled ({cancelledBookings.length})
              </h2>
              <div className="space-y-4">
                {cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} badge={getStatusBadge(booking)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, badge }: { booking: any; badge: React.ReactNode }) {
  const space = booking.space;
  const gym = space?.gym;

  return (
    <Link href={`/bookings/${booking.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900">{space?.name || 'Space'}</h3>
                {badge}
              </div>
              <p className="mt-1 text-sm text-gray-600">{gym?.name || 'Gym'}</p>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(booking.start_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(booking.start_at)} - {formatTime(booking.end_at)}
                </span>
                {gym?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {gym.city || 'Denver'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCents(booking.total_amount)}</p>
                {booking.refund_amount && booking.refund_amount > 0 && (
                  <p className="text-sm text-green-600">
                    Refunded: {formatCents(booking.refund_amount)}
                  </p>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
