/**
 * Booking wizard constants
 */

export const TOTAL_STEPS = 3;

export const MIN_TRAVELERS = 1;
export const MAX_TRAVELERS = 5;

export const MIN_AGE = 1;
export const MAX_AGE = 100;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;
export const FULL_NAME_MAX_LENGTH = 100;

export const STORAGE_KEYS = {
  BOOKING_DATA: 'space-travel-booking',
  BOOKING_HISTORY: 'space-travel-booking-history',
} as const;

export const BOOKING_HISTORY_LIMIT = 50;

export const API_DELAY = {
  MIN: 1000,
  MAX: 2000,
} as const;

export const BOOKING_ID_PREFIX = 'BK';

export const STEP_LABELS = {
  1: { title: 'Destination', description: 'Select your destination' },
  2: { title: 'Travelers', description: 'Add traveler information' },
  3: { title: 'Review', description: 'Review and confirm' },
} as const;
