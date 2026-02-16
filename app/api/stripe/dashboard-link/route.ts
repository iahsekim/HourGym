import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get gym
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('stripe_account_id')
      .eq('owner_id', user.id)
      .single();

    if (gymError || !gym?.stripe_account_id) {
      return NextResponse.redirect(new URL('/gym/dashboard/settings', request.url));
    }

    // Create login link
    const loginLink = await stripe.accounts.createLoginLink(gym.stripe_account_id);

    return NextResponse.redirect(loginLink.url);
  } catch (error: any) {
    console.error('Stripe dashboard link error:', error);
    return NextResponse.redirect(new URL('/gym/dashboard/settings', request.url));
  }
}
