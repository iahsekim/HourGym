'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';
import { calculateBookingPrice } from '@/lib/booking/pricing';
import {
  validateBookingRequest,
  canCancelWithRefund,
} from '@/lib/booking/availability';
import { CONSTANTS } from '@/lib/utils/constants';
import { revalidatePath } from 'next/cache';
import {
  sendBookingCancellationEmail,
  type CancellationEmailData,
} from '@/lib/notifications/email';
import { sendBookingCancellationSMS } from '@/lib/notifications/sms';
import { formatTime } from '@/lib/utils';
import type {
  ActionResponse,
  Booking,
  BookingWithDetails,
  SpaceWithGym,
} from '@/types';

export interface CreateBookingData {
  spaceId: string;
  startAt: string; // ISO string
  endAt: string; // ISO string
  waiverAccepted: boolean;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
}

/**
 * Create a Stripe Checkout session for booking
 * The actual booking is created in the webhook after payment succeeds
 */
export async function createBookingCheckout(
  data: CreateBookingData
): Promise<ActionResponse<CreateCheckoutResponse>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Please sign in to book' };
  }

  // Validate waiver accepted
  if (!data.waiverAccepted) {
    return { success: false, error: 'You must accept the liability waiver' };
  }

  // Get space with gym details
  const { data: space, error: spaceError } = await supabase
    .from('spaces')
    .select(
      `
      *,
      gym:gyms(
        id,
        name,
        owner_id,
        cancellation_policy,
        stripe_account_id,
        stripe_onboarded,
        timezone
      )
    `
    )
    .eq('id', data.spaceId)
    .single();

  if (spaceError || !space) {
    return { success: false, error: 'Space not found' };
  }

  const gym = space.gym as any;

  // Prevent gym owners from booking their own space
  if (gym.owner_id === user.id) {
    return { success: false, error: 'You cannot book your own space' };
  }

  // Check gym is ready to accept payments
  if (!gym.stripe_onboarded || !gym.stripe_account_id) {
    return {
      success: false,
      error: 'This gym is not ready to accept bookings yet',
    };
  }

  const startAt = new Date(data.startAt);
  const endAt = new Date(data.endAt);

  // Get existing bookings for conflict check
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('space_id', data.spaceId)
    .eq('status', 'confirmed')
    .gte('end_at', new Date().toISOString());

  // Validate booking request
  const validation = validateBookingRequest(
    startAt,
    endAt,
    existingBookings || []
  );

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Calculate pricing
  const pricing = calculateBookingPrice(space.hourly_rate, startAt, endAt);

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name, phone')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email!,
        name: profile?.full_name || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    } catch (stripeError) {
      console.error('Stripe customer creation failed:', stripeError);
      return { success: false, error: 'Payment setup failed. Please try again.' };
    }
  }

  // Create Stripe Checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: pricing.total,
            product_data: {
              name: `${space.name} at ${gym.name}`,
              description: `${pricing.hours} hour${pricing.hours > 1 ? 's' : ''} on ${startAt.toLocaleDateString()}`,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: pricing.platformFee,
        transfer_data: {
          destination: gym.stripe_account_id,
        },
        metadata: {
          space_id: data.spaceId,
          renter_id: user.id,
          start_at: data.startAt,
          end_at: data.endAt,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/spaces/${data.spaceId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      metadata: {
        space_id: data.spaceId,
        renter_id: user.id,
        start_at: data.startAt,
        end_at: data.endAt,
        waiver_accepted: 'true',
        total_amount: pricing.total.toString(),
        platform_fee: pricing.platformFee.toString(),
        gym_payout: pricing.gymPayout.toString(),
      },
    });

    return { success: true, data: { checkoutUrl: session.url! } };
  } catch (stripeError: any) {
    console.error('Stripe checkout creation failed:', stripeError);
    return {
      success: false,
      error: stripeError.message || 'Payment setup failed. Please try again.',
    };
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(
  bookingId: string
): Promise<BookingWithDetails | null> {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      space:spaces(
        *,
        gym:gyms(*)
      ),
      renter:profiles(*)
    `
    )
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return null;
  }

  return booking as unknown as BookingWithDetails;
}

/**
 * Get booking by Stripe checkout session ID
 */
export async function getBookingByCheckoutSession(
  sessionId: string
): Promise<BookingWithDetails | null> {
  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return null;
    }

    // Get the booking using the payment intent ID
    const supabase = await createClient();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        space:spaces(
          *,
          gym:gyms(*)
        ),
        renter:profiles(*)
      `
      )
      .eq('stripe_payment_intent_id', session.payment_intent)
      .single();

    if (error || !booking) {
      return null;
    }

    return booking as unknown as BookingWithDetails;
  } catch (error) {
    console.error('Error fetching booking by checkout session:', error);
    return null;
  }
}

/**
 * Get all bookings for the current renter
 */
export async function getRenterBookings(): Promise<BookingWithDetails[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      space:spaces(
        *,
        gym:gyms(*)
      ),
      renter:profiles(*)
    `
    )
    .eq('renter_id', user.id)
    .order('start_at', { ascending: false });

  if (error) {
    console.error('Error fetching renter bookings:', error);
    return [];
  }

  return (bookings || []) as unknown as BookingWithDetails[];
}

/**
 * Cancel a booking (by renter or gym owner)
 */
export async function cancelBooking(
  bookingId: string
): Promise<ActionResponse<{ refundAmount: number; refundId?: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get booking with full details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      space:spaces(
        *,
        gym:gyms(*)
      ),
      renter:profiles(*)
    `
    )
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  const space = booking.space as unknown as SpaceWithGym;
  const renter = booking.renter as any;

  // Check authorization (renter or gym owner)
  const isRenter = booking.renter_id === user.id;
  const isOwner = space.gym.owner_id === user.id;

  if (!isRenter && !isOwner) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check if already cancelled
  if (booking.status === 'cancelled') {
    return { success: false, error: 'Booking is already cancelled' };
  }

  // Check if in the past
  if (new Date(booking.start_at) < new Date()) {
    return { success: false, error: 'Cannot cancel a past booking' };
  }

  // Determine refund eligibility
  // Gym owner cancellations always get full refund for renter
  const policy = space.gym.cancellation_policy;
  const eligibleForRefund = isOwner || canCancelWithRefund(booking, policy);

  let refundAmount = 0;
  let refundId: string | undefined;

  // Process refund if eligible and payment exists
  if (eligibleForRefund && booking.stripe_payment_intent_id) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        reason: isOwner ? 'requested_by_customer' : 'requested_by_customer',
        metadata: {
          booking_id: bookingId,
          cancelled_by: user.id,
          cancellation_type: isOwner ? 'gym_owner' : 'renter',
        },
      });
      refundAmount = refund.amount;
      refundId = refund.id;
    } catch (stripeError: any) {
      console.error('Refund failed:', stripeError);
      
      // Check if already refunded
      if (stripeError.code === 'charge_already_refunded') {
        return { success: false, error: 'This booking has already been refunded' };
      }
      
      return { success: false, error: 'Refund processing failed. Please try again or contact support.' };
    }
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      refund_amount: refundAmount,
      stripe_refund_id: refundId || null,
    })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, error: 'Failed to update booking' };
  }

  // Send cancellation notifications (non-blocking)
  sendCancellationNotifications(booking, space, renter, refundAmount, isOwner).catch(
    (err) => console.error('Failed to send cancellation notifications:', err)
  );

  revalidatePath('/bookings');
  revalidatePath('/gym/dashboard/calendar');

  return { success: true, data: { refundAmount, refundId } };
}

/**
 * Send cancellation notifications to renter
 */
async function sendCancellationNotifications(
  booking: any,
  space: SpaceWithGym,
  renter: any,
  refundAmount: number,
  cancelledByGym: boolean
) {
  const startAt = new Date(booking.start_at);
  const endAt = new Date(booking.end_at);

  const cancellationData: CancellationEmailData = {
    spaceName: space.name,
    gymName: space.gym.name,
    date: startAt,
    startTime: formatTime(startAt),
    endTime: formatTime(endAt),
    refundAmount: refundAmount / 100,
    cancelledByGym,
  };

  // Send email
  if (renter.email) {
    await sendBookingCancellationEmail(renter.email, cancellationData);
  }

  // Send SMS if opted in
  if (renter.phone && renter.sms_opt_in) {
    await sendBookingCancellationSMS(renter.phone, {
      spaceName: space.name,
      gymName: space.gym.name,
      date: startAt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      refundAmount: refundAmount / 100,
    });
  }
}

/**
 * Get available time slots for a space on a specific date
 */
export async function getAvailableSlotsForDate(
  spaceId: string,
  date: string // YYYY-MM-DD
) {
  const supabase = await createClient();
  const { generateAvailableSlots } = await import('@/lib/booking/availability');

  // Get space with gym for timezone
  const { data: space } = await supabase
    .from('spaces')
    .select('*, gym:gyms(timezone)')
    .eq('id', spaceId)
    .single();

  if (!space) {
    return [];
  }

  // Get availability templates
  const { data: templates } = await supabase
    .from('availability_templates')
    .select('*')
    .eq('space_id', spaceId);

  // Get overrides for this date
  const { data: overrides } = await supabase
    .from('availability_overrides')
    .select('*')
    .eq('space_id', spaceId)
    .eq('date', date);

  // Get existing bookings that might affect this date
  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);
  const endOfDate = new Date(date);
  endOfDate.setHours(23, 59, 59, 999);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('space_id', spaceId)
    .eq('status', 'confirmed')
    .gte('start_at', startOfDate.toISOString())
    .lte('start_at', endOfDate.toISOString());

  const timezone = (space.gym as any).timezone || CONSTANTS.DEFAULT_TIMEZONE;

  return generateAvailableSlots(
    new Date(date),
    templates || [],
    overrides || [],
    bookings || [],
    timezone
  );
}
