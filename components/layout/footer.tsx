import Link from 'next/link';
import { Clock, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Clock className="h-7 w-7 text-brand-600" />
              <span className="text-xl font-bold text-gray-900">HourGym</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-600">
              Rent gym space by the hour. Perfect for personal trainers, coaches, and
              fitness professionals in Denver.
            </p>
          </div>

          {/* For Renters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Trainers</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/spaces" className="text-sm text-gray-600 hover:text-brand-600">
                  Browse Spaces
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-sm text-gray-600 hover:text-brand-600">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-gray-600 hover:text-brand-600">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* For Gym Owners */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Gyms</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/gym/onboarding"
                  className="text-sm text-gray-600 hover:text-brand-600"
                >
                  List Your Space
                </Link>
              </li>
              <li>
                <Link
                  href="/gym/dashboard"
                  className="text-sm text-gray-600 hover:text-brand-600"
                >
                  Gym Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/gym/dashboard/earnings"
                  className="text-sm text-gray-600 hover:text-brand-600"
                >
                  Earnings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Denver, Colorado</span>
              </li>
              <li>
                <a
                  href="mailto:hello@hourgym.com"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  hello@hourgym.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © {currentYear} HourGym. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
