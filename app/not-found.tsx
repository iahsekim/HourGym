import Link from 'next/link';
import { Button } from '@/components/ui';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* 404 illustration */}
        <div className="mb-8">
          <span className="text-8xl font-bold text-brand-600 sm:text-9xl">404</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-gray-600">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
          moved or doesn&apos;t exist.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Button>
          </Link>
          <Link href="/spaces">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Browse spaces
            </Button>
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="mt-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Go back
        </button>
      </div>
    </div>
  );
}
