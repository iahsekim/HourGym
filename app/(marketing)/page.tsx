import Link from 'next/link';
import type { Metadata } from 'next';
import { Button, Card, CardContent } from '@/components/ui';
import {
  Clock,
  DollarSign,
  Calendar,
  Shield,
  MapPin,
  Zap,
  ArrowRight,
  Check,
  Dumbbell,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'HourGym - Rent Gym Space by the Hour | Denver',
  description:
    'Find and book gym space by the hour in Denver. Perfect for personal trainers, combat sports coaches, and fitness professionals. No long-term commitments.',
  openGraph: {
    title: 'HourGym - Rent Gym Space by the Hour',
    description:
      'Find and book gym space by the hour in Denver. Perfect for personal trainers and coaches.',
  },
};

const features = [
  {
    icon: Clock,
    title: 'Flexible Hourly Booking',
    description: 'Book exactly the time you need. No monthly contracts or long-term commitments.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'See upfront pricing for every space. No hidden fees or surprise charges.',
  },
  {
    icon: Calendar,
    title: 'Instant Booking',
    description: 'Book available slots instantly. Get confirmation and access details right away.',
  },
  {
    icon: Shield,
    title: 'Verified Spaces',
    description: 'All gyms are verified for quality, safety, and professional equipment.',
  },
];

const forTrainers = [
  'Access premium training spaces without overhead',
  'Book by the hour when clients are available',
  'Professional equipment and amenities included',
  'Build your client base in multiple locations',
];

const forGyms = [
  'Generate revenue from unused space',
  'Attract new potential members',
  'Full control over pricing and availability',
  'Secure payments with automatic payouts',
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="container-page relative py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              Rent Gym Space
              <span className="block text-brand-200">By the Hour</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-brand-100 sm:text-xl">
              Perfect for personal trainers, combat sports coaches, and fitness
              professionals in Denver. No contracts, no commitments—just space when you
              need it.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/spaces">
                <Button size="lg" className="w-full bg-white text-brand-700 hover:bg-brand-50 sm:w-auto">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find a Space
                </Button>
              </Link>
              <Link href="/gym/onboarding">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10 sm:w-auto"
                >
                  List Your Gym
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="heading-2">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple, transparent, and designed for fitness professionals.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Trainers / For Gyms Section */}
      <section className="section bg-gray-50">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* For Trainers */}
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                  <Dumbbell className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">For Trainers</h3>
              </div>
              <ul className="mt-6 space-y-4">
                {forTrainers.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/spaces" className="mt-6 inline-block">
                <Button>
                  Browse Available Spaces
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* For Gyms */}
            <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">For Gym Owners</h3>
              </div>
              <ul className="mt-6 space-y-4">
                {forGyms.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/gym/onboarding" className="mt-6 inline-block">
                <Button variant="outline">
                  Start Listing Your Space
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-brand-600">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-brand-100">
              Join the growing community of trainers and gyms in Denver using HourGym.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full bg-white text-brand-700 hover:bg-brand-50 sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/spaces">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10 sm:w-auto"
                >
                  Browse Spaces
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
