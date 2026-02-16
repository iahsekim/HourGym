import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gymId } = await request.json();

    // Verify ownership
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .eq('owner_id', user.id)
      .single();

    if (gymError || !gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    let accountId = gym.stripe_account_id;

    // Create Stripe Connect account if needed
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          gym_id: gymId,
          user_id: user.id,
        },
      });

      accountId = account.id;

      // Save account ID to gym
      await supabase
        .from('gyms')
        .update({ stripe_account_id: accountId })
        .eq('id', gymId);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/gym/dashboard/settings?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/gym/dashboard/settings?connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe link' },
      { status: 500 }
    );
  }
}
