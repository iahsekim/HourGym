import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getGymByOwner } from '@/actions/gyms';
import { Header } from '@/components/layout';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  DollarSign,
  Settings,
  Clock,
} from 'lucide-react';

const sidebarItems = [
  { href: '/gym/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/gym/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/gym/dashboard/spaces', label: 'Spaces', icon: MapPin },
  { href: '/gym/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/gym/dashboard/settings', label: 'Settings', icon: Settings },
];

export default async function GymDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/gym/dashboard');
  }

  const gym = await getGymByOwner();

  if (!gym) {
    redirect('/gym/onboarding');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ email: user.email || '', role: 'gym_owner' }} />

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 border-r border-gray-200 bg-white lg:block">
          <div className="sticky top-16 p-4">
            {/* Gym info */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <Clock className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{gym.name}</p>
                  <p className="text-sm text-gray-500">Gym Dashboard</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile navigation */}
        <div className="border-b border-gray-200 bg-white lg:hidden">
          <nav className="container-page flex gap-1 overflow-x-auto py-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          <div className="container-page py-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
