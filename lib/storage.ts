import type { BookingFormData, BookingHistoryEntry } from '@/types/booking';
import { STORAGE_KEYS, BOOKING_HISTORY_LIMIT } from '@/constants/booking';

/**
 * Persists booking form data to sessionStorage
 */
export function saveBookingData(data: BookingFormData): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save booking data:', error);
  }
}

/**
 * Retrieves booking form data from sessionStorage
 */
export function loadBookingData(): BookingFormData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
    if (!stored) return null;
    return JSON.parse(stored) as BookingFormData;
  } catch (error) {
    console.error('Failed to load booking data:', error);
    return null;
  }
}

/**
 * Clears booking form data from sessionStorage
 */
export function clearBookingData(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.BOOKING_DATA);
  } catch (error) {
    console.error('Failed to clear booking data:', error);
  }
}

/**
 * Saves bookingId to booking history in localStorage
 */
export function saveBookingId(bookingId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getBookingHistory();
    const newEntry = {
      bookingId,
      createdAt: new Date().toISOString(),
    };
    const updatedHistory = [newEntry, ...history].slice(0, BOOKING_HISTORY_LIMIT);
    localStorage.setItem(STORAGE_KEYS.BOOKING_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save booking ID:', error);
  }
}

/**
 * Retrieves booking history from localStorage
 */
export function getBookingHistory(): BookingHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKING_HISTORY);
    if (!stored) return [];
    return JSON.parse(stored) as BookingHistoryEntry[];
  } catch (error) {
    console.error('Failed to load booking history:', error);
    return [];
  }
}
