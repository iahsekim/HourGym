'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Alert } from '@/components/ui';
import { cancelBooking } from '@/actions/bookings';
import { AlertTriangle, XCircle } from 'lucide-react';

interface CancelBookingButtonProps {
  bookingId: string;
  canRefund: boolean;
  cancellationPolicy: string;
}

const policyDescriptions: Record<string, string> = {
  flexible: '24 hours before',
  moderate: '48 hours before',
  strict: '7 days before',
};

export function CancelBookingButton({
  bookingId,
  canRefund,
  cancellationPolicy,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (!result.success) {
        setError(result.error || 'Failed to cancel booking');
        return;
      }

      setShowModal(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => setShowModal(true)}
      >
        <XCircle className="mr-2 h-4 w-4" />
        Cancel Booking
      </Button>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Cancel Booking"
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row-reverse">
            <Button
              variant="destructive"
              onClick={handleCancel}
              loading={isPending}
              disabled={isPending}
            >
              {isPending ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isPending}
            >
              Keep Booking
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {error && (
            <Alert variant="error">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Are you sure you want to cancel?</p>
              <p className="mt-1 text-amber-700">
                {canRefund ? (
                  <>You will receive a full refund for this booking.</>
                ) : (
                  <>
                    This booking is past the {policyDescriptions[cancellationPolicy]} cancellation
                    cutoff. No refund will be issued.
                  </>
                )}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Cancellation policy:{' '}
            <span className="font-medium capitalize">{cancellationPolicy}</span>
          </p>
        </div>
      </Modal>
    </>
  );
}
