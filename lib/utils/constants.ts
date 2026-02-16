export const CONSTANTS = {
  // Booking rules
  BUFFER_MINUTES: 30,
  MIN_BOOKING_HOURS: 1,
  MAX_BOOKING_HOURS: 4,

  // Pricing
  PLATFORM_FEE_PERCENT: 15,
  MIN_HOURLY_RATE_CENTS: 1500, // $15

  // Cancellation cutoffs (hours before start)
  CANCELLATION_CUTOFFS: {
    flexible: 24,
    moderate: 48,
    strict: 168, // 7 days
  },

  // Time
  DEFAULT_TIMEZONE: 'America/Denver',

  // Notifications
  REMINDER_HOURS_BEFORE: 1,
  REMINDER_MINUTES_BEFORE: 60, // 1 hour in minutes

  // Pagination
  SPACES_PER_PAGE: 12,
  BOOKINGS_PER_PAGE: 10,
} as const;

export type CancellationPolicy = keyof typeof CONSTANTS.CANCELLATION_CUTOFFS;
