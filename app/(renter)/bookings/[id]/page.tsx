import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getBookingById, getBookingByCheckoutSession } from '@/actions/bookings';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Alert } from '@/components/ui';
import { CancelBookingButton } from '@/components/booking/cancel-booking-button';
import { formatCents, formatDate, formatTime, formatDateTime } from '@/lib/utils';
import { canCancelWithRefund } from '@/lib/booking/availability';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
  CreditCard,
  Receipt,
} from 'lucide-react';

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Booking Details',
};

export default async function BookingDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/bookings/${params.id}`);
  }

  // Check if this is a Stripe checkout session ID (starts with cs_)
  let booking;
  if (params.id.startsWith('cs_')) {
    booking = await getBookingByCheckoutSession(params.id);
  } else {
    booking = await getBookingById(params.id);
  }

  if (!booking) {
    notFound();
  }

  // Check authorization
  if (booking.renter_id !== user.id) {
    notFound();
  }

  const space = booking.space;
  const gym = space?.gym;
  const now = new Date();
  const startAt = new Date(booking.start_at);
  const endAt = new Date(booking.end_at);
  const isPast = endAt < now;
  const isUpcoming = booking.status === 'confirmed' && startAt > now;
  const isCancelled = booking.status === 'cancelled';

  // Calculate if can cancel with refund
  const canRefund = isUpcoming && canCancelWithRefund(booking, gym?.cancellation_policy || 'moderate');

  const getStatusBadge = () => {
    if (isCancelled) {
      return <Badge variant="error">Cancelled</Badge>;
    }
    if (isPast) {
      return <Badge variant="default">Completed</Badge>;
    }
    if (startAt.toDateString() === now.toDateString()) {
      return <Badge variant="success">Today</Badge>;
    }
    return <Badge variant="success">Upcoming</Badge>;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href="/bookings"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to bookings
      </Link>

      {/* Success message for new bookings */}
      {params.id.startsWith('cs_') && booking.status === 'confirmed' && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="ml-3">
            <h3 className="font-medium text-green-800">Booking confirmed!</h3>
            <p className="mt-1 text-sm text-green-700">
              Your booking has been confirmed. You&apos;ll receive a confirmation email shortly.
            </p>
          </div>
        </Alert>
      )}

      {/* Cancellation message */}
      {isCancelled && (
        <Alert variant="error" className="mb-6">
          <XCircle className="h-5 w-5 text-red-600" />
          <div className="ml-3">
            <h3 className="font-medium text-red-800">Booking cancelled</h3>
            {booking.refund_amount && booking.refund_amount > 0 && (
              <p className="mt-1 text-sm text-red-700">
                Refund of {formatCents(booking.refund_amount)} has been processed.
              </p>
            )}
          </div>
        </Alert>
      )}

      {/* Main booking card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{space?.name || 'Space'}</CardTitle>
              <p className="mt-1 text-gray-600">{gym?.name || 'Gym'}</p>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Date & Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(booking.start_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">
                  {formatTime(booking.start_at)} - {formatTime(booking.end_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {gym?.address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{gym.address}</p>
                <p className="text-sm text-gray-600">{gym.city || 'Denver'}, CO</p>
              </div>
            </div>
          )}

          {/* Entry instructions */}
          {space?.entry_instructions && isUpcoming && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Entry Instructions</p>
                  <p className="mt-1 text-sm text-blue-700">{space.entry_instructions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment details */}
          <div className="border-t pt-6">
            <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900">
              <Receipt className="h-5 w-5" />
              Payment Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking total</span>
                <span className="font-medium">{formatCents(booking.total_amount)}</span>
              </div>
              {booking.refund_amount && booking.refund_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Refund</span>
                  <span>-{formatCents(booking.refund_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>
                  {booking.refund_amount && booking.refund_amount > 0 ? 'Net paid' : 'Total paid'}
                </span>
                <span>
                  {formatCents(booking.total_amount - (booking.refund_amount || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isUpcoming && !isCancelled && (
            <div className="border-t pt-6">
              <CancelBookingButton
                bookingId={booking.id}
                canRefund={canRefund}
                cancellationPolicy={gym?.cancellation_policy || 'moderate'}
              />
            </div>
          )}

          {/* Booking reference */}
          <div className="border-t pt-4 text-center text-xs text-gray-400">
            Booking ID: {booking.id}
            <br />
            Booked on {formatDateTime(booking.created_at)}
          </div>
        </CardContent>
      </Card>

      {/* View space link */}
      <div className="mt-6 text-center">
        <Link href={`/spaces/${space?.id}`} className="text-sm text-brand-600 hover:underline">
          View space details →
        </Link>
      </div>
    </div>
  );
}
