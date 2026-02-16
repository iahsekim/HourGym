import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReminderEmail } from '@/lib/notifications/email';
import { sendBookingReminderSMS } from '@/lib/notifications/sms';
import { formatTime } from '@/lib/utils';
import { CONSTANTS } from '@/lib/utils/constants';

/**
 * Cron job endpoint for sending booking reminders
 * Runs every 15 minutes via Vercel Cron
 *
 * Sends reminders for bookings starting in ~1 hour that haven't
 * already received a reminder.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret in production
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Calculate time window for reminders (bookings starting in 45-75 minutes)
  // This gives a 30-minute window to catch bookings even if cron runs every 15 minutes
  const now = new Date();
  const minTime = new Date(now.getTime() + 45 * 60 * 1000);
  const maxTime = new Date(now.getTime() + 75 * 60 * 1000);

  console.log(
    `Checking for reminders between ${minTime.toISOString()} and ${maxTime.toISOString()}`
  );

  // Find confirmed bookings that need reminders
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      start_at,
      end_at,
      space:spaces(
        name,
        entry_instructions,
        gym:gyms(
          name,
          address,
          contact_name,
          contact_phone
        )
      ),
      renter:profiles(
        email,
        phone,
        full_name,
        sms_opt_in
      )
    `
    )
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)
    .gte('start_at', minTime.toISOString())
    .lte('start_at', maxTime.toISOString());

  if (error) {
    console.error('Failed to fetch bookings for reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }

  if (!bookings || bookings.length === 0) {
    console.log('No bookings need reminders');
    return NextResponse.json({ processed: 0, success: true });
  }

  console.log(`Found ${bookings.length} bookings needing reminders`);

  const results = {
    processed: 0,
    emailsSent: 0,
    smsSent: 0,
    errors: [] as string[],
  };

  // Process each booking
  for (const booking of bookings) {
    const space = booking.space as any;
    const gym = space?.gym;
    const renter = booking.renter as any;

    if (!space || !gym || !renter) {
      console.error(`Missing data for booking ${booking.id}`);
      results.errors.push(`Missing data for booking ${booking.id}`);
      continue;
    }

    const startDate = new Date(booking.start_at);
    const endDate = new Date(booking.end_at);

    try {
      // Send email reminder
      if (renter.email) {
        const emailResult = await sendReminderEmail(renter.email, {
          spaceName: space.name,
          gymName: gym.name,
          date: startDate,
          startTime: formatTime(startDate),
          endTime: formatTime(endDate),
          address: gym.address,
          entryInstructions: space.entry_instructions,
          contactName: gym.contact_name,
          contactPhone: gym.contact_phone,
          bookingId: booking.id,
        });

        if (emailResult.success) {
          results.emailsSent++;
        } else {
          results.errors.push(`Email failed for ${booking.id}: ${emailResult.error}`);
        }
      }

      // Send SMS reminder if opted in
      if (renter.sms_opt_in && renter.phone) {
        const smsResult = await sendBookingReminderSMS(renter.phone, {
          spaceName: space.name,
          gymName: gym.name,
          startTime: formatTime(startDate),
          address: gym.address,
          entryInstructions: space.entry_instructions,
          contactPhone: gym.contact_phone,
        });

        if (smsResult.success) {
          results.smsSent++;
        } else {
          results.errors.push(`SMS failed for ${booking.id}: ${smsResult.error}`);
        }
      }

      // Mark reminder as sent
      await supabase
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', booking.id);

      results.processed++;
    } catch (err: any) {
      console.error(`Error processing reminder for booking ${booking.id}:`, err);
      results.errors.push(`Error for ${booking.id}: ${err.message}`);
    }
  }

  console.log('Reminder job completed:', results);

  return NextResponse.json({
    success: true,
    ...results,
  });
}

// POST is also supported for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}

// Config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing
