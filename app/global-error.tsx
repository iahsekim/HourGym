'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          {/* Error icon */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-gray-600">
            We&apos;re sorry, but something unexpected happened. Our team has been notified
            and is working on it.
          </p>

          {/* Error digest for debugging */}
          {error.digest && (
            <p className="mt-4 font-mono text-xs text-gray-400">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Link href="/">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
