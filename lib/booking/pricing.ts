import { CONSTANTS } from '@/lib/utils/constants';
import type { PricingResult } from '@/types';

/**
 * Calculate booking price including platform fee
 */
export function calculateBookingPrice(
  hourlyRateCents: number,
  startAt: Date,
  endAt: Date
): PricingResult {
  const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60);
  const subtotal = Math.round(hourlyRateCents * hours);
  const platformFee = Math.round(subtotal * (CONSTANTS.PLATFORM_FEE_PERCENT / 100));
  const gymPayout = subtotal - platformFee;
  const total = subtotal;

  return {
    hours,
    subtotal,
    platformFee,
    total,
    gymPayout,
  };
}

/**
 * Format cents as currency string
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
