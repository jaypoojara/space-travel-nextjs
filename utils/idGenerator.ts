import { BOOKING_ID_PREFIX } from '@/constants/booking';

/**
 * Utility functions for generating unique IDs
 */

/**
 * Generates a unique traveler ID
 */
export function generateTravelerId(): string {
  return `traveler-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generates a unique booking ID
 */
export function generateBookingId(): string {
  return `${BOOKING_ID_PREFIX}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}
