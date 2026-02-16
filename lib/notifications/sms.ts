import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are available
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS message using Twilio
 */
export async function sendSMS(to: string, body: string): Promise<SMSResult> {
  if (!client) {
    console.warn('Twilio not configured - SMS not sent');
    return { success: false, error: 'Twilio not configured' };
  }

  if (!fromNumber) {
    console.warn('Twilio phone number not configured');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  // Validate phone number format (must start with +)
  const formattedNumber = formatPhoneNumber(to);
  if (!formattedNumber) {
    return { success: false, error: 'Invalid phone number format' };
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: formattedNumber,
    });

    console.log(`SMS sent successfully: ${message.sid}`);
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSMS(
  to: string,
  data: {
    spaceName: string;
    gymName: string;
    date: string;
    startTime: string;
    address: string | null;
  }
): Promise<SMSResult> {
  const body = `HourGym: Your booking is confirmed!

📍 ${data.spaceName} at ${data.gymName}
📅 ${data.date}
🕐 ${data.startTime}
${data.address ? `\n📍 ${data.address}` : ''}

View details at ${process.env.NEXT_PUBLIC_APP_URL}/bookings`;

  return sendSMS(to, body);
}

/**
 * Send booking cancellation SMS
 */
export async function sendBookingCancellationSMS(
  to: string,
  data: {
    spaceName: string;
    gymName: string;
    date: string;
    refundAmount: number;
  }
): Promise<SMSResult> {
  const refundMessage = data.refundAmount > 0 
    ? `A refund of $${data.refundAmount.toFixed(2)} has been initiated.`
    : 'No refund was applied based on the cancellation policy.';

  const body = `HourGym: Your booking has been cancelled.

${data.spaceName} at ${data.gymName}
${data.date}

${refundMessage}`;

  return sendSMS(to, body);
}

/**
 * Send booking reminder SMS (1 hour before)
 */
export async function sendBookingReminderSMS(
  to: string,
  data: {
    spaceName: string;
    gymName: string;
    startTime: string;
    address: string | null;
    entryInstructions: string | null;
    contactPhone: string | null;
  }
): Promise<SMSResult> {
  let body = `HourGym Reminder: Your booking starts in 1 hour!

📍 ${data.spaceName} at ${data.gymName}
🕐 ${data.startTime}`;

  if (data.address) {
    body += `\n\n📍 ${data.address}`;
  }

  if (data.entryInstructions) {
    body += `\n\n🚪 Entry: ${data.entryInstructions}`;
  }

  if (data.contactPhone) {
    body += `\n\n📞 Day-of contact: ${data.contactPhone}`;
  }

  return sendSMS(to, body);
}

/**
 * Format phone number to E.164 format
 * Assumes US numbers if no country code provided
 */
function formatPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If already in E.164 format
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If 10 digits (US number without country code)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If 11 digits starting with 1 (US number with country code)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  // Invalid format
  return null;
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && fromNumber);
}
