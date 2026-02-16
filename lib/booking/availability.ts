import { CONSTANTS } from '@/lib/utils/constants';
import type { AvailabilityTemplate, AvailabilityOverride, Booking, TimeSlot } from '@/types';

/**
 * Generate available time slots for a given date
 */
export function generateAvailableSlots(
  date: Date,
  templates: AvailabilityTemplate[],
  overrides: AvailabilityOverride[],
  existingBookings: Booking[],
  timezone: string = CONSTANTS.DEFAULT_TIMEZONE
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];

  // Check if entire day is blocked
  const dayOverride = overrides.find(
    (o) => o.date === dateStr && o.blocked && !o.start_time && !o.end_time
  );
  if (dayOverride) {
    return [];
  }

  // Get template for this day of week
  const dayTemplates = templates.filter((t) => t.day_of_week === dayOfWeek);
  if (dayTemplates.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];

  for (const template of dayTemplates) {
    const [startHour, startMin] = template.start_time.split(':').map(Number);
    const [endHour, endMin] = template.end_time.split(':').map(Number);

    // Generate hourly slots
    let currentHour = startHour;
    while (currentHour < endHour || (currentHour === endHour && 0 < endMin)) {
      const slotStart = new Date(date);
      slotStart.setHours(currentHour, 0, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(currentHour + 1, 0, 0, 0);

      // Check if slot is within template hours
      if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && 0 > endMin)) {
        break;
      }

      // Check if slot is blocked by override
      const isBlocked = overrides.some((o) => {
        if (o.date !== dateStr || !o.blocked) return false;
        if (!o.start_time || !o.end_time) return false;

        const [overrideStartH, overrideStartM] = o.start_time.split(':').map(Number);
        const [overrideEndH, overrideEndM] = o.end_time.split(':').map(Number);

        const overrideStart = new Date(date);
        overrideStart.setHours(overrideStartH, overrideStartM, 0, 0);

        const overrideEnd = new Date(date);
        overrideEnd.setHours(overrideEndH, overrideEndM, 0, 0);

        return slotStart < overrideEnd && slotEnd > overrideStart;
      });

      // Check if slot conflicts with existing bookings (including buffer)
      const hasConflict = existingBookings.some((booking) => {
        if (booking.status !== 'confirmed') return false;

        const bookingStart = new Date(booking.start_at);
        const bookingEnd = new Date(booking.end_at);

        // Add buffer time
        const bufferMs = CONSTANTS.BUFFER_MINUTES * 60 * 1000;
        const bufferedStart = new Date(bookingStart.getTime() - bufferMs);
        const bufferedEnd = new Date(bookingEnd.getTime() + bufferMs);

        return slotStart < bufferedEnd && slotEnd > bufferedStart;
      });

      // Check if slot is in the past
      const isPast = slotStart < new Date();

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !isBlocked && !hasConflict && !isPast,
      });

      currentHour++;
    }
  }

  return slots;
}

/**
 * Validate a booking request
 */
export function validateBookingRequest(
  startAt: Date,
  endAt: Date,
  existingBookings: Booking[]
): { valid: boolean; error?: string } {
  const now = new Date();

  // Check if in the past
  if (startAt < now) {
    return { valid: false, error: 'Cannot book in the past' };
  }

  // Check duration
  const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);

  if (hours < CONSTANTS.MIN_BOOKING_HOURS) {
    return {
      valid: false,
      error: `Minimum booking duration is ${CONSTANTS.MIN_BOOKING_HOURS} hour`,
    };
  }

  if (hours > CONSTANTS.MAX_BOOKING_HOURS) {
    return {
      valid: false,
      error: `Maximum booking duration is ${CONSTANTS.MAX_BOOKING_HOURS} hours`,
    };
  }

  // Check for conflicts with buffer
  const bufferMs = CONSTANTS.BUFFER_MINUTES * 60 * 1000;
  const bufferedStart = new Date(startAt.getTime() - bufferMs);
  const bufferedEnd = new Date(endAt.getTime() + bufferMs);

  const hasConflict = existingBookings.some((booking) => {
    if (booking.status !== 'confirmed') return false;

    const bookingStart = new Date(booking.start_at);
    const bookingEnd = new Date(booking.end_at);

    return bufferedStart < bookingEnd && bufferedEnd > bookingStart;
  });

  if (hasConflict) {
    return {
      valid: false,
      error: 'This time slot conflicts with another booking',
    };
  }

  return { valid: true };
}

/**
 * Check if booking can be cancelled with refund based on policy
 */
export function canCancelWithRefund(
  booking: Booking,
  policy: 'flexible' | 'moderate' | 'strict'
): boolean {
  const now = new Date();
  const startAt = new Date(booking.start_at);
  const hoursUntilStart = (startAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  const cutoffHours = CONSTANTS.CANCELLATION_CUTOFFS[policy];
  return hoursUntilStart >= cutoffHours;
}
