import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Clock className="h-10 w-10 text-brand-600" />
          <span className="text-2xl font-bold text-gray-900">HourGym</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-4 rounded-xl bg-white px-4 py-8 shadow-sm sm:mx-0 sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
