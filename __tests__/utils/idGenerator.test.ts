import { generateBookingId, generateTravelerId } from '@/utils/idGenerator';
import { BOOKING_ID_PREFIX } from '@/constants/booking';

describe('ID Generator utilities', () => {
  describe('generateBookingId', () => {
    it(`should return string starting with "${BOOKING_ID_PREFIX}"`, () => {
      const bookingId = generateBookingId();
      expect(bookingId.startsWith(BOOKING_ID_PREFIX)).toBe(true);
    });

    it('should return uppercase alphanumeric characters after prefix', () => {
      const bookingId = generateBookingId();
      const afterPrefix = bookingId.slice(BOOKING_ID_PREFIX.length);

      // Should only contain uppercase letters and numbers
      expect(afterPrefix).toMatch(/^[A-Z0-9]+$/);
    });

    it('should generate IDs with consistent format', () => {
      const bookingId = generateBookingId();

      // Should match pattern: BK + 7 uppercase alphanumeric chars
      expect(bookingId).toMatch(/^BK[A-Z0-9]{7}$/);
    });

    it('should produce unique IDs on multiple calls', () => {
      const ids = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        ids.add(generateBookingId());
      }

      // All IDs should be unique
      expect(ids.size).toBe(iterations);
    });

    it('should not produce empty ID after prefix', () => {
      const bookingId = generateBookingId();
      const afterPrefix = bookingId.slice(BOOKING_ID_PREFIX.length);

      expect(afterPrefix.length).toBeGreaterThan(0);
    });
  });

  describe('generateTravelerId', () => {
    it('should return string starting with "traveler-"', () => {
      const travelerId = generateTravelerId();
      expect(travelerId.startsWith('traveler-')).toBe(true);
    });

    it('should include timestamp component', () => {
      const beforeTimestamp = Date.now();
      const travelerId = generateTravelerId();
      const afterTimestamp = Date.now();

      // Extract timestamp from ID (format: traveler-{timestamp}-{random})
      const parts = travelerId.split('-');
      const timestamp = parseInt(parts[1], 10);

      expect(timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should include random component after timestamp', () => {
      const travelerId = generateTravelerId();
      const parts = travelerId.split('-');

      // Should have at least 3 parts: "traveler", timestamp, random
      expect(parts.length).toBeGreaterThanOrEqual(3);

      // Random part should exist and be non-empty
      const randomPart = parts[2];
      expect(randomPart).toBeDefined();
      expect(randomPart.length).toBeGreaterThan(0);
    });

    it('should produce unique IDs on multiple calls', () => {
      const ids = new Set<string>();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        ids.add(generateTravelerId());
      }

      // All IDs should be unique
      expect(ids.size).toBe(iterations);
    });

    it('should match expected format pattern', () => {
      const travelerId = generateTravelerId();

      // Should match: traveler-{timestamp}-{alphanumeric}
      expect(travelerId).toMatch(/^traveler-\d+-[a-z0-9]+$/);
    });

    it('should generate different IDs even in rapid succession', () => {
      // Generate IDs as fast as possible
      const id1 = generateTravelerId();
      const id2 = generateTravelerId();
      const id3 = generateTravelerId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });
});
