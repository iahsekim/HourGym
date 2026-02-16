import { Resend } from 'resend';
import { BookingConfirmedEmail } from '@/emails/booking-confirmed';
import { BookingCancelledEmail } from '@/emails/booking-cancelled';
import { ReminderEmail } from '@/emails/reminder';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'HourGym <bookings@hourgym.com>';

export interface BookingEmailData {
  spaceName: string;
  gymName: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string | null;
  entryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  totalAmount: number; // in dollars
  bookingId: string;
}

export interface CancellationEmailData {
  spaceName: string;
  gymName: string;
  date: Date;
  startTime: string;
  endTime: string;
  refundAmount: number; // in dollars
  cancelledByGym: boolean;
}

export interface ReminderEmailData {
  spaceName: string;
  gymName: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: string | null;
  entryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  bookingId: string;
}

/**
 * Send booking confirmation email to renter
 */
export async function sendBookingConfirmationEmail(
  to: string,
  data: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Confirmed: ${data.spaceName} at ${data.gymName}`,
      react: BookingConfirmedEmail(data),
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Confirmation email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking cancellation email to renter
 */
export async function sendBookingCancellationEmail(
  to: string,
  data: CancellationEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Booking Cancelled: ${data.spaceName} at ${data.gymName}`,
      react: BookingCancelledEmail(data),
    });

    if (error) {
      console.error('Failed to send cancellation email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Cancellation email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send reminder email to renter (1 hour before booking)
 */
export async function sendReminderEmail(
  to: string,
  data: ReminderEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Reminder: Your booking starts in 1 hour - ${data.spaceName}`,
      react: ReminderEmail(data),
    });

    if (error) {
      console.error('Failed to send reminder email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Reminder email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending reminder email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to gym owner about new booking
 */
export async function sendGymOwnerBookingNotification(
  to: string,
  data: {
    spaceName: string;
    renterName: string;
    renterEmail: string;
    date: Date;
    startTime: string;
    endTime: string;
    totalAmount: number;
    gymPayout: number;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Booking: ${data.spaceName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">New Booking Received! 🎉</h1>
          
          <div style="margin-bottom: 20px;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Space</p>
            <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${data.spaceName}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Renter</p>
            <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${data.renterName}</p>
            <p style="color: #666; font-size: 14px; margin: 4px 0 0;">${data.renterEmail}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">When</p>
            <p style="color: #1a1a1a; font-size: 16px; margin: 0;">
              ${data.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${data.startTime} - ${data.endTime}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 24px 0;" />
          
          <div style="margin-bottom: 20px;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Your Payout</p>
            <p style="color: #22c55e; font-size: 24px; font-weight: 600; margin: 0;">$${data.gymPayout.toFixed(2)}</p>
            <p style="color: #999; font-size: 12px; margin: 4px 0 0;">Total booking: $${data.totalAmount.toFixed(2)}</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/gym/dashboard" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 16px;">
            View Dashboard
          </a>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send gym owner notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending gym owner notification:', error);
    return { success: false, error: error.message };
  }
}
