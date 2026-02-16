import { getGymByOwner } from '@/actions/gyms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { GymSettingsForm } from '@/components/gym/settings-form';
import { StripeConnectButton } from '@/components/gym/stripe-connect-button';
import { Check, AlertCircle, CreditCard } from 'lucide-react';
import { Suspense } from 'react';

export const metadata = {
  title: 'Settings | HourGym',
};

// Loading component for Stripe section
function StripeLoadingState() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-48 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// Stripe Connect Section Component
async function StripeConnectSection({ gymId, isOnboarded }: { gymId: string; isOnboarded: boolean }) {
  return (
    <StripeConnectButton 
      gymId={gymId} 
      isOnboarded={isOnboarded}
      showDashboardLink={true}
    />
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { connected?: string; refresh?: string };
}) {
  const gym = await getGymByOwner();

  if (!gym) return null;

  // Handle return from Stripe Connect
  const justConnected = searchParams.connected === 'true';
  const needsRefresh = searchParams.refresh === 'true';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your gym profile and payouts</p>
      </div>

      {/* Success message if just connected */}
      {justConnected && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Stripe account connected successfully!
              </p>
              <p className="text-sm text-green-700">
                Your account is being verified. You&apos;ll be able to receive bookings once verification is complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh message if onboarding link expired */}
      {needsRefresh && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">
                Onboarding link expired
              </p>
              <p className="text-sm text-amber-700">
                Please click the button below to continue setting up your Stripe account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <CardTitle>Payouts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<StripeLoadingState />}>
            <StripeConnectSection 
              gymId={gym.id} 
              isOnboarded={gym.stripe_onboarded} 
            />
          </Suspense>

          {/* Payout Information */}
          {gym.stripe_onboarded && (
            <div className="mt-6 border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900">How payouts work</h4>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  When a renter completes a booking, funds are transferred to your Stripe account.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  HourGym collects a 15% platform fee from each booking.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  Payouts are sent to your bank account on Stripe&apos;s standard schedule (usually 2-3 business days).
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gym Details */}
      <Card>
        <CardHeader>
          <CardTitle>Gym Details</CardTitle>
        </CardHeader>
        <CardContent>
          <GymSettingsForm gym={gym} />
        </CardContent>
      </Card>

      {/* Cancellation Policy Info */}
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your current policy: <span className="font-medium capitalize">{gym.cancellation_policy}</span>
            </p>
            
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">Policy Details</h4>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Flexible</span>
                  <span className="text-gray-900">Full refund if cancelled 24+ hours before</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Moderate</span>
                  <span className="text-gray-900">Full refund if cancelled 48+ hours before</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Strict</span>
                  <span className="text-gray-900">Full refund if cancelled 7+ days before</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Note: If you cancel a booking, the renter always receives a full refund regardless of the policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
