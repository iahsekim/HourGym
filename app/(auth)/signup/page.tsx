import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignupForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your HourGym account and start booking gym space.',
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/spaces');
  }

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-gray-900">
        Create your account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Start booking gym space by the hour
      </p>

      <div className="mt-8">
        <SignupForm />
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500">
          Log in
        </Link>
      </p>
    </>
  );
}
