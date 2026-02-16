import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Log in to your HourGym account.',
};

interface PageProps {
  searchParams: { redirect?: string; error?: string };
}

export default async function LoginPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(searchParams.redirect || '/spaces');
  }

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-gray-900">
        Welcome back
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Log in to your account to continue
      </p>

      {searchParams.error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
          {searchParams.error === 'invalid_credentials'
            ? 'Invalid email or password'
            : 'Something went wrong. Please try again.'}
        </div>
      )}

      <div className="mt-8">
        <LoginForm redirectTo={searchParams.redirect} />
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-500">
          Sign up
        </Link>
      </p>
    </>
  );
}
