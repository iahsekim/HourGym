'use client';

import { useState } from 'react';
import { Button, Alert } from '@/components/ui';
import { Check, ExternalLink, CreditCard, Loader2 } from 'lucide-react';

interface StripeConnectButtonProps {
  gymId: string;
  isOnboarded: boolean;
  showDashboardLink?: boolean;
}

export function StripeConnectButton({
  gymId,
  isOnboarded,
  showDashboardLink = false,
}: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-connect-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe link');
      }

      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isOnboarded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Stripe Connected</p>
            <p className="text-sm text-gray-500">You can receive bookings and payouts</p>
          </div>
        </div>

        {showDashboardLink && (
          <a
            href="/api/stripe/dashboard-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Stripe Dashboard
            </Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <CreditCard className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">Connect Stripe to receive payments</p>
          <p className="mt-1 text-sm text-gray-500">
            Set up your bank account to receive payouts from bookings. You&apos;ll need to
            provide basic business information.
          </p>
        </div>
      </div>

      <Button onClick={handleConnect} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Connect with Stripe
          </>
        )}
      </Button>
    </div>
  );
}
