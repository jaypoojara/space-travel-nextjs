import {
  saveBookingData,
  loadBookingData,
  clearBookingData,
  saveBookingId,
  getBookingHistory,
} from '@/lib/storage';
import { STORAGE_KEYS, BOOKING_HISTORY_LIMIT } from '@/constants/booking';
import type { BookingFormData } from '@/types/booking';

describe('Storage utilities', () => {
  // Mock sessionStorage and localStorage
  let sessionStorageMock: Record<string, string>;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    sessionStorageMock = {};
    localStorageMock = {};

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => sessionStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete sessionStorageMock[key];
        }),
        clear: jest.fn(() => {
          sessionStorageMock = {};
        }),
      },
      writable: true,
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  describe('saveBookingData', () => {
    it('should save booking data to sessionStorage', () => {
      const bookingData: BookingFormData = {
        destination: { id: 'mars', name: 'Mars', distance: '225M km', travelTime: '7 months' },
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
        travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
      };

      saveBookingData(bookingData);

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.BOOKING_DATA,
        JSON.stringify(bookingData)
      );
    });
  });

  describe('loadBookingData', () => {
    it('should return null when no data exists', () => {
      const result = loadBookingData();
      expect(result).toBeNull();
    });

    it('should return parsed booking data when data exists', () => {
      const bookingData: BookingFormData = {
        destination: { id: 'mars', name: 'Mars', distance: '225M km', travelTime: '7 months' },
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
        travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
      };

      sessionStorageMock[STORAGE_KEYS.BOOKING_DATA] = JSON.stringify(bookingData);

      const result = loadBookingData();
      expect(result).toEqual(bookingData);
    });

    it('should return null for corrupted JSON data', () => {
      sessionStorageMock[STORAGE_KEYS.BOOKING_DATA] = 'invalid json{';

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = loadBookingData();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('clearBookingData', () => {
    it('should remove booking data from sessionStorage', () => {
      clearBookingData();

      expect(sessionStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.BOOKING_DATA);
    });
  });

  describe('saveBookingId', () => {
    it('should add booking ID with correct timestamp format', () => {
      const bookingId = 'BK123456';
      const mockDate = new Date('2026-01-16T10:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      saveBookingId(bookingId);

      const savedHistory = JSON.parse(localStorageMock[STORAGE_KEYS.BOOKING_HISTORY]);
      expect(savedHistory[0].bookingId).toBe(bookingId);
      expect(savedHistory[0].createdAt).toBe('2026-01-16T10:00:00.000Z');

      jest.useRealTimers();
    });

    it('should prepend new entry to history (newest first)', () => {
      // Set up existing history
      const existingHistory = [
        { bookingId: 'BK000001', createdAt: '2026-01-15T10:00:00.000Z' },
        { bookingId: 'BK000002', createdAt: '2026-01-14T10:00:00.000Z' },
      ];
      localStorageMock[STORAGE_KEYS.BOOKING_HISTORY] = JSON.stringify(existingHistory);

      saveBookingId('BK000003');

      const savedHistory = JSON.parse(localStorageMock[STORAGE_KEYS.BOOKING_HISTORY]);
      expect(savedHistory[0].bookingId).toBe('BK000003');
      expect(savedHistory[1].bookingId).toBe('BK000001');
      expect(savedHistory[2].bookingId).toBe('BK000002');
    });

    it(`should enforce history limit of ${BOOKING_HISTORY_LIMIT} entries`, () => {
      // Create history at the limit
      const existingHistory = Array.from({ length: BOOKING_HISTORY_LIMIT }, (_, i) => ({
        bookingId: `BK${String(i).padStart(6, '0')}`,
        createdAt: new Date(2026, 0, i + 1).toISOString(),
      }));
      localStorageMock[STORAGE_KEYS.BOOKING_HISTORY] = JSON.stringify(existingHistory);

      // Add one more entry
      saveBookingId('BKNEW001');

      const savedHistory = JSON.parse(localStorageMock[STORAGE_KEYS.BOOKING_HISTORY]);

      // Should still be at the limit
      expect(savedHistory.length).toBe(BOOKING_HISTORY_LIMIT);
      // Newest should be first
      expect(savedHistory[0].bookingId).toBe('BKNEW001');
      // The last entry in the original (index 49) should be dropped
      // Since we started with indices 0-49, BK000049 was the last entry and should be dropped
      expect(
        savedHistory.find(
          (e: { bookingId: string }) => e.bookingId === `BK${String(BOOKING_HISTORY_LIMIT - 1).padStart(6, '0')}`
        )
      ).toBeUndefined();
    });

    it('should drop oldest entry when exceeding limit', () => {
      // Create history at the limit
      const existingHistory = Array.from({ length: BOOKING_HISTORY_LIMIT }, (_, i) => ({
        bookingId: `BK${String(i).padStart(6, '0')}`,
        createdAt: new Date(2026, 0, i + 1).toISOString(),
      }));
      localStorageMock[STORAGE_KEYS.BOOKING_HISTORY] = JSON.stringify(existingHistory);

      const oldestId = existingHistory[existingHistory.length - 1].bookingId;

      saveBookingId('BKNEW001');

      const savedHistory = JSON.parse(localStorageMock[STORAGE_KEYS.BOOKING_HISTORY]);

      // The oldest entry should be removed
      const hasOldestEntry = savedHistory.some(
        (entry: { bookingId: string }) => entry.bookingId === oldestId
      );
      expect(hasOldestEntry).toBe(false);
    });
  });

  describe('getBookingHistory', () => {
    it('should return empty array when storage is empty', () => {
      const result = getBookingHistory();
      expect(result).toEqual([]);
    });

    it('should return parsed history when data exists', () => {
      const history = [
        { bookingId: 'BK123456', createdAt: '2026-01-16T10:00:00.000Z' },
        { bookingId: 'BK789012', createdAt: '2026-01-15T10:00:00.000Z' },
      ];
      localStorageMock[STORAGE_KEYS.BOOKING_HISTORY] = JSON.stringify(history);

      const result = getBookingHistory();
      expect(result).toEqual(history);
    });

    it('should return empty array for corrupted JSON data', () => {
      localStorageMock[STORAGE_KEYS.BOOKING_HISTORY] = 'not valid json{';

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = getBookingHistory();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle null storage value gracefully', () => {
      // Explicitly set to null behavior
      localStorageMock[STORAGE_KEYS.BOOKING_HISTORY] = undefined as unknown as string;

      const result = getBookingHistory();
      expect(result).toEqual([]);
    });
  });
});
