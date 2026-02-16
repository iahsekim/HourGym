'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Checkbox, Alert, FormField } from '@/components/ui';
import { createBookingCheckout } from '@/actions/bookings';
import { formatCents } from '@/lib/utils';
import { CONSTANTS } from '@/lib/utils/constants';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface BookingFormProps {
  spaceId: string;
  hourlyRate: number;
  gymOwnerId: string;
  userId: string;
}

export function BookingForm({ spaceId, hourlyRate, gymOwnerId, userId }: BookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hours, setHours] = useState(1);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is the gym owner
  if (gymOwnerId === userId) {
    return (
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <p className="ml-2">You cannot book your own space.</p>
      </Alert>
    );
  }

  // Calculate pricing
  const subtotal = hourlyRate * hours;
  const platformFee = Math.round(subtotal * (CONSTANTS.PLATFORM_FEE_PERCENT / 100));
  const total = subtotal;

  // Get min date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Get max date (90 days from now)
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Please select a date');
      return;
    }

    if (!startTime) {
      setError('Please select a start time');
      return;
    }

    if (!waiverAccepted) {
      setError('You must accept the liability waiver to continue');
      return;
    }

    // Calculate start and end times
    const [hourStr, minStr] = startTime.split(':');
    const startAt = new Date(date);
    startAt.setHours(parseInt(hourStr), parseInt(minStr), 0, 0);

    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + hours);

    // Validate not in the past
    if (startAt < new Date()) {
      setError('Cannot book a time in the past');
      return;
    }

    startTransition(async () => {
      const result = await createBookingCheckout({
        spaceId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        waiverAccepted,
      });

      if (!result.success) {
        setError(result.error || 'Something went wrong. Please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      if (result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <p className="ml-2 text-sm">{error}</p>
        </Alert>
      )}

      {/* Date picker */}
      <FormField label="Date" required>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="pl-10"
            required
          />
        </div>
      </FormField>

      {/* Start time */}
      <FormField label="Start Time" required>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            step={3600}
            className="pl-10"
            required
          />
        </div>
      </FormField>

      {/* Duration */}
      <FormField label="Duration" required>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHours(h)}
              className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                hours === h
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {h} hr{h > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </FormField>

      {/* Price breakdown */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {formatCents(hourlyRate)} × {hours} hour{hours > 1 ? 's' : ''}
            </span>
            <span className="font-medium">{formatCents(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Platform fee (included)</span>
            <span>{formatCents(platformFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatCents(total)}</span>
          </div>
        </div>
      </div>

      {/* Waiver */}
      <div className="rounded-lg border border-gray-200 p-4">
        <Checkbox
          checked={waiverAccepted}
          onChange={(e) => setWaiverAccepted(e.target.checked)}
          label="I accept the liability waiver and understand that I am responsible for any injuries or damages during my booking."
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isPending || !date || !startTime || !waiverAccepted}
        loading={isPending}
      >
        {isPending ? 'Processing...' : `Book for ${formatCents(total)}`}
      </Button>

      <p className="text-center text-xs text-gray-500">
        You&apos;ll be redirected to Stripe to complete payment
      </p>
    </form>
  );
}
