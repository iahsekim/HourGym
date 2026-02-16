import Stripe from 'stripe';
import { stripe } from './client';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendBookingConfirmationEmail,
  sendGymOwnerBookingNotification,
  type BookingEmailData,
} from '@/lib/notifications/email';
import { sendBookingConfirmationSMS } from '@/lib/notifications/sms';
import { formatTime } from '@/lib/utils';

/**
 * Verify and construct a Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Handle checkout.session.completed event
 * Creates the booking record after successful payment and sends notifications
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  const supabase = createAdminClient();
  const metadata = session.metadata;

  if (!metadata) {
    console.error('No metadata in checkout session');
    return { success: false, error: 'No metadata' };
  }

  // Check if booking already exists (idempotency)
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('stripe_payment_intent_id', session.payment_intent)
    .single();

  if (existingBooking) {
    console.log('Booking already exists:', existingBooking.id);
    return { success: true, bookingId: existingBooking.id };
  }

  // Parse pricing from metadata
  const totalAmount = parseInt(metadata.total_amount || '0', 10);
  const platformFee = parseInt(metadata.platform_fee || '0', 10);
  const gymPayout = parseInt(metadata.gym_payout || '0', 10);

  // Create booking record
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      space_id: metadata.space_id,
      renter_id: metadata.renter_id,
      start_at: metadata.start_at,
      end_at: metadata.end_at,
      status: 'confirmed',
      total_amount: totalAmount || session.amount_total || 0,
      platform_fee: platformFee || Math.round((session.amount_total || 0) * 0.15),
      gym_payout: gymPayout || Math.round((session.amount_total || 0) * 0.85),
      currency: 'usd',
      stripe_payment_intent_id: session.payment_intent as string,
      waiver_accepted_at:
        metadata.waiver_accepted === 'true' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create booking:', error);
    return { success: false, error: error.message };
  }

  console.log('Booking created:', booking.id);

  // Send notifications (non-blocking)
  sendBookingNotifications(booking.id, supabase).catch((err) => {
    console.error('Failed to send booking notifications:', err);
  });

  return { success: true, bookingId: booking.id };
}

/**
 * Send booking confirmation notifications to renter and gym owner
 */
async function sendBookingNotifications(
  bookingId: string,
  supabase: ReturnType<typeof createAdminClient>
) {
  // Get full booking details
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      space:spaces(
        name,
        entry_instructions,
        gym:gyms(
          name,
          address,
          contact_name,
          contact_phone,
          owner_id
        )
      ),
      renter:profiles(
        email,
        phone,
        full_name,
        sms_opt_in
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    console.error('Failed to fetch booking for notifications:', error);
    return;
  }

  const space = booking.space as any;
  const gym = space.gym;
  const renter = booking.renter as any;

  const startAt = new Date(booking.start_at);
  const endAt = new Date(booking.end_at);

  // Prepare email data
  const emailData: BookingEmailData = {
    spaceName: space.name,
    gymName: gym.name,
    date: startAt,
    startTime: formatTime(startAt),
    endTime: formatTime(endAt),
    address: gym.address,
    entryInstructions: space.entry_instructions,
    contactName: gym.contact_name,
    contactPhone: gym.contact_phone,
    totalAmount: booking.total_amount / 100,
    bookingId: booking.id,
  };

  // Send confirmation email to renter
  if (renter.email) {
    await sendBookingConfirmationEmail(renter.email, emailData);
  }

  // Send SMS to renter if opted in
  if (renter.phone && renter.sms_opt_in) {
    await sendBookingConfirmationSMS(renter.phone, {
      spaceName: space.name,
      gymName: gym.name,
      date: startAt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      startTime: formatTime(startAt),
      address: gym.address,
    });
  }

  // Send notification to gym owner
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', gym.owner_id)
    .single();

  if (ownerProfile?.email) {
    await sendGymOwnerBookingNotification(ownerProfile.email, {
      spaceName: space.name,
      renterName: renter.full_name || 'Guest',
      renterEmail: renter.email,
      date: startAt,
      startTime: formatTime(startAt),
      endTime: formatTime(endAt),
      totalAmount: booking.total_amount / 100,
      gymPayout: booking.gym_payout / 100,
    });
  }
}

/**
 * Handle account.updated event
 * Updates the gym's Stripe onboarded status
 */
export async function handleAccountUpdated(
  account: Stripe.Account
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Check if charges are enabled (main criteria for accepting payments)
  const isOnboarded = account.charges_enabled === true;

  const { error } = await supabase
    .from('gyms')
    .update({
      stripe_onboarded: isOnboarded,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id);

  if (error) {
    console.error('Failed to update gym Stripe status:', error);
    return { success: false, error: error.message };
  }

  console.log(
    `Gym Stripe status updated for account ${account.id}: onboarded=${isOnboarded}`
  );
  return { success: true };
}

/**
 * Handle charge.refunded event
 * Updates the booking with refund information
 */
export async function handleChargeRefunded(
  charge: Stripe.Charge
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Get the payment intent ID from the charge
  const paymentIntentId = charge.payment_intent;

  if (!paymentIntentId) {
    console.error('No payment intent in refunded charge');
    return { success: false, error: 'No payment intent' };
  }

  // Find the booking by payment intent
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, refund_amount')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (fetchError || !booking) {
    // This might be a refund for a non-booking payment, which is fine
    console.log('No booking found for refunded charge:', paymentIntentId);
    return { success: true };
  }

  // Calculate total refund amount from all refunds on this charge
  const totalRefunded = charge.amount_refunded;

  // Get the latest refund ID
  const refunds = await stripe.refunds.list({
    charge: charge.id,
    limit: 1,
  });
  const latestRefundId = refunds.data[0]?.id;

  // Update booking with refund info
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      refund_amount: totalRefunded,
      stripe_refund_id: latestRefundId,
      status: totalRefunded >= charge.amount ? 'cancelled' : booking.status,
      cancelled_at:
        totalRefunded >= charge.amount && booking.status !== 'cancelled'
          ? new Date().toISOString()
          : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', booking.id);

  if (updateError) {
    console.error('Failed to update booking with refund:', updateError);
    return { success: false, error: updateError.message };
  }

  console.log(`Booking ${booking.id} updated with refund: ${totalRefunded}`);
  return { success: true };
}

/**
 * Handle payment_intent.payment_failed event
 * Logs the failure (no booking created since checkout wasn't completed)
 */
export async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<{ success: boolean }> {
  const metadata = paymentIntent.metadata;

  console.log('Payment failed:', {
    paymentIntentId: paymentIntent.id,
    spaceId: metadata?.space_id,
    renterId: metadata?.renter_id,
    error: paymentIntent.last_payment_error?.message,
  });

  // No database action needed - booking only created on success
  return { success: true };
}

/**
 * Handle checkout.session.expired event
 * Logs the expiration (no cleanup needed since booking wasn't created)
 */
export async function handleCheckoutExpired(
  session: Stripe.Checkout.Session
): Promise<{ success: boolean }> {
  const metadata = session.metadata;

  console.log('Checkout session expired:', {
    sessionId: session.id,
    spaceId: metadata?.space_id,
    renterId: metadata?.renter_id,
  });

  // No database action needed
  return { success: true };
}

/**
 * Handle account.external_account.created event
 * Logs when a connected account adds a bank account
 */
export async function handleExternalAccountCreated(
  externalAccount: Stripe.BankAccount | Stripe.Card
): Promise<{ success: boolean }> {
  console.log('External account created:', {
    accountId: externalAccount.account,
    type: externalAccount.object,
    last4: 'last4' in externalAccount ? externalAccount.last4 : undefined,
  });

  return { success: true };
}

/**
 * Handle payout.paid event
 * Could be used to track when gyms receive their payouts
 */
export async function handlePayoutPaid(
  payout: Stripe.Payout
): Promise<{ success: boolean }> {
  console.log('Payout paid:', {
    payoutId: payout.id,
    amount: payout.amount,
    currency: payout.currency,
    arrivalDate: new Date(payout.arrival_date * 1000).toISOString(),
  });

  return { success: true };
}
