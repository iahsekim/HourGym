import { createClient } from '@/lib/supabase/server';
import { getGymWithSpaces } from '@/actions/gyms';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { formatCents, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, Calendar, ExternalLink, Download, Users } from 'lucide-react';
import { EarningsChart } from '@/components/gym/earnings-chart';
import Link from 'next/link';

export const metadata = {
  title: 'Earnings',
};

export default async function EarningsPage() {
  const supabase = await createClient();
  const gym = await getGymWithSpaces();

  if (!gym) return null;

  const spaceIds = gym.spaces.map((s: any) => s.id);

  // Get all completed bookings
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, space:spaces(name), renter:profiles(full_name, email)')
    .in('space_id', spaceIds)
    .in('status', ['confirmed', 'completed'])
    .order('created_at', { ascending: false });

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthBookings =
    allBookings?.filter((b) => new Date(b.created_at) >= startOfMonth) || [];

  const lastMonthBookings =
    allBookings?.filter(
      (b) =>
        new Date(b.created_at) >= startOfLastMonth &&
        new Date(b.created_at) <= endOfLastMonth
    ) || [];

  const thisMonthEarnings = thisMonthBookings.reduce(
    (sum, b) => sum + b.gym_payout,
    0
  );
  const lastMonthEarnings = lastMonthBookings.reduce(
    (sum, b) => sum + b.gym_payout,
    0
  );
  const totalEarnings = allBookings?.reduce((sum, b) => sum + b.gym_payout, 0) || 0;
  const totalBookings = allBookings?.length || 0;

  // Calculate growth percentage
  const growthPercent = lastMonthEarnings > 0
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : thisMonthEarnings > 0 ? 100 : 0;

  // Generate monthly data for chart (last 6 months)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthBookings = allBookings?.filter((b) => {
      const created = new Date(b.created_at);
      return created >= monthStart && created <= monthEnd;
    }) || [];

    chartData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      earnings: monthBookings.reduce((sum, b) => sum + b.gym_payout, 0) / 100,
      bookings: monthBookings.length,
    });
  }

  const recentBookings = allBookings?.slice(0, 10) || [];

  // Calculate average booking value
  const avgBookingValue = totalBookings > 0 
    ? Math.round(totalEarnings / totalBookings) 
    : 0;

  // Get unique renters
  const uniqueRenters = new Set(allBookings?.map(b => b.renter_id) || []).size;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="mt-1 text-gray-600">Track your revenue and payouts</p>
        </div>
        {gym.stripe_onboarded && gym.stripe_account_id && (
          <a
            href={`/api/stripe/dashboard-link`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Dashboard
            </Button>
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              {growthPercent !== 0 && (
                <span className={`flex items-center text-sm font-medium ${
                  growthPercent > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`mr-1 h-4 w-4 ${growthPercent < 0 ? 'rotate-180' : ''}`} />
                  {growthPercent > 0 ? '+' : ''}{growthPercent}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">This month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCents(thisMonthEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Last month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCents(lastMonthEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">All time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCents(totalEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Avg per booking</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCents(avgBookingValue)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Earnings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <EarningsChart data={chartData} />
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-sm text-gray-500">{totalBookings} total bookings</p>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="py-8 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">
                Transactions will appear here once you get your first booking
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.space?.name || 'Space'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.renter?.full_name || booking.renter?.email || 'Guest'} • {formatDate(booking.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +{formatCents(booking.gym_payout)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCents(booking.platform_fee)} fee
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout info */}
      {!gym.stripe_onboarded ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <h3 className="font-medium text-amber-800">Set up payouts</h3>
              <p className="mt-1 text-sm text-amber-700">
                Payouts are paused until you complete Stripe setup. Connect your
                bank account to receive your earnings.
              </p>
              <Link href="/gym/dashboard/settings">
                <Button size="sm" className="mt-3">
                  Connect Stripe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 flex-shrink-0 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-800">Automatic payouts enabled</h3>
              <p className="mt-1 text-sm text-gray-600">
                Your earnings are automatically transferred to your connected bank account
                on a rolling basis (typically 2-7 days after the booking).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
