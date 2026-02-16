import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getGymWithSpaces } from '@/actions/gyms';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { formatCents, formatDate, formatTime } from '@/lib/utils';
import {
  Calendar,
  DollarSign,
  MapPin,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const gym = await getGymWithSpaces();

  if (!gym) return null;

  const spaceIds = gym.spaces.map((s: any) => s.id);

  // Get upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      space:spaces(name),
      renter:profiles(full_name, email)
    `
    )
    .in('space_id', spaceIds)
    .eq('status', 'confirmed')
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(5);

  // Calculate time periods
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get all confirmed bookings for this month
  const { data: thisMonthBookings } = await supabase
    .from('bookings')
    .select('gym_payout, start_at, end_at, renter_id')
    .in('space_id', spaceIds)
    .eq('status', 'confirmed')
    .gte('created_at', startOfMonth.toISOString());

  // Get last month's bookings for comparison
  const { data: lastMonthBookings } = await supabase
    .from('bookings')
    .select('gym_payout')
    .in('space_id', spaceIds)
    .eq('status', 'confirmed')
    .gte('created_at', startOfLastMonth.toISOString())
    .lt('created_at', startOfMonth.toISOString());

  // Get this week's bookings
  const { data: thisWeekBookings } = await supabase
    .from('bookings')
    .select('gym_payout, start_at, end_at')
    .in('space_id', spaceIds)
    .eq('status', 'confirmed')
    .gte('start_at', startOfWeek.toISOString())
    .lte('start_at', new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

  // Calculate stats
  const monthlyEarnings = thisMonthBookings?.reduce((sum, b) => sum + b.gym_payout, 0) || 0;
  const lastMonthEarnings = lastMonthBookings?.reduce((sum, b) => sum + b.gym_payout, 0) || 0;
  
  // Calculate month-over-month growth
  const growthPercent = lastMonthEarnings > 0 
    ? Math.round(((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : monthlyEarnings > 0 ? 100 : 0;

  // Calculate total hours booked this month
  const monthlyHours = thisMonthBookings?.reduce((sum, b) => {
    const start = new Date(b.start_at);
    const end = new Date(b.end_at);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0) || 0;

  // Calculate total hours this week
  const weeklyHours = thisWeekBookings?.reduce((sum, b) => {
    const start = new Date(b.start_at);
    const end = new Date(b.end_at);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0) || 0;

  // Get unique renters this month
  const uniqueRenters = new Set(thisMonthBookings?.map(b => b.renter_id) || []).size;

  const activeSpaces = gym.spaces.filter((s: any) => s.is_active).length;
  const totalBookingsThisMonth = thisMonthBookings?.length || 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back to {gym.name}</p>
        </div>
        <Link href="/gym/dashboard/earnings">
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* Alert if Stripe not connected */}
      {!gym.stripe_onboarded && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">
              Complete your payout setup
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Connect your Stripe account to start accepting bookings and
              receiving payouts.
            </p>
            <Link href="/gym/dashboard/settings">
              <Button size="sm" className="mt-3">
                Set up payouts
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Primary Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              {growthPercent !== 0 && (
                <span className={`flex items-center text-sm font-medium ${growthPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`mr-1 h-4 w-4 ${growthPercent < 0 ? 'rotate-180' : ''}`} />
                  {growthPercent > 0 ? '+' : ''}{growthPercent}%
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">This month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCents(monthlyEarnings)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                <Calendar className="h-5 w-5 text-brand-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Bookings this month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalBookingsThisMonth}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Hours booked this week</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(weeklyHours)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Unique renters</p>
              <p className="text-2xl font-semibold text-gray-900">
                {uniqueRenters}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Upcoming bookings</p>
                <p className="text-xl font-semibold text-gray-900">
                  {upcomingBookings?.length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active spaces</p>
                <p className="text-xl font-semibold text-gray-900">
                  {activeSpaces}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hours this month</p>
                <p className="text-xl font-semibold text-gray-900">
                  {Math.round(monthlyHours)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Bookings</CardTitle>
          <Link href="/gym/dashboard/calendar">
            <Button variant="ghost" size="sm">
              View calendar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!upcomingBookings || upcomingBookings.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No upcoming bookings yet</p>
              <p className="text-sm text-gray-400">
                Share your space listing to start getting bookings
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingBookings.map((booking) => {
                const isToday = new Date(booking.start_at).toDateString() === new Date().toDateString();
                const isTomorrow = new Date(booking.start_at).toDateString() === 
                  new Date(Date.now() + 86400000).toDateString();
                
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-3">
                      {(isToday || isTomorrow) && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isToday ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isToday ? 'Today' : 'Tomorrow'}
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.space.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.renter.full_name || booking.renter.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatDate(booking.start_at)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatTime(booking.start_at)} -{' '}
                        {formatTime(booking.end_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/gym/dashboard/spaces/new">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <MapPin className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add a space</h3>
                <p className="text-sm text-gray-500">
                  List another room or area
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/gym/dashboard/calendar">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Block dates</h3>
                <p className="text-sm text-gray-500">
                  Manage your availability
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
