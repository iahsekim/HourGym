import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getGymByOwner } from '@/actions/gyms';
import { OnboardingForm } from './onboarding-form';
import { Clock, Check } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'List Your Gym',
  description: 'Start earning by listing your gym space on HourGym.',
};

const benefits = [
  'Generate revenue from unused space',
  'Attract new potential members',
  'Full control over pricing and availability',
  'Secure payments with automatic payouts',
  'No upfront costs - only 15% platform fee on bookings',
];

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/gym/onboarding');
  }

  // Check if already has a gym
  const existingGym = await getGymByOwner();
  if (existingGym) {
    redirect('/gym/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Clock className="h-7 w-7 text-brand-600" />
            <span className="text-xl font-bold text-gray-900">HourGym</span>
          </Link>
        </div>
      </header>

      <main className="container-page py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left - Benefits */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                List your gym on HourGym
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Turn your unused space into revenue. List your gym and start accepting
                hourly bookings from trainers and coaches.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Form */}
            <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Get started in minutes
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Fill in your gym details to create your listing.
              </p>

              <div className="mt-6">
                <OnboardingForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
