import { parseTravelTimeToDays, calculateMinReturnDate } from '@/utils/travelTime';

describe('travelTime utilities', () => {
  describe('parseTravelTimeToDays', () => {
    it('should parse days correctly', () => {
      expect(parseTravelTimeToDays('3 days')).toBe(3);
      expect(parseTravelTimeToDays('1 day')).toBe(1);
      expect(parseTravelTimeToDays('10 days')).toBe(10);
    });

    it('should parse months correctly', () => {
      expect(parseTravelTimeToDays('7 months')).toBe(210); // 7 * 30
      expect(parseTravelTimeToDays('1 month')).toBe(30);
      expect(parseTravelTimeToDays('12 months')).toBe(360);
    });

    it('should parse years correctly', () => {
      expect(parseTravelTimeToDays('2 years')).toBe(730); // 2 * 365
      expect(parseTravelTimeToDays('1 year')).toBe(365);
      expect(parseTravelTimeToDays('4 years')).toBe(1460);
    });

    it('should handle case insensitive input', () => {
      expect(parseTravelTimeToDays('3 DAYS')).toBe(3);
      expect(parseTravelTimeToDays('7 MONTHS')).toBe(210);
      expect(parseTravelTimeToDays('2 YEARS')).toBe(730);
    });

    it('should handle whitespace variations', () => {
      expect(parseTravelTimeToDays('  3 days  ')).toBe(3);
      expect(parseTravelTimeToDays('7  months')).toBe(210);
    });

    it('should return 0 for invalid input', () => {
      expect(parseTravelTimeToDays('invalid')).toBe(0);
      expect(parseTravelTimeToDays('')).toBe(0);
      expect(parseTravelTimeToDays('abc days')).toBe(0);
    });
  });

  describe('calculateMinReturnDate', () => {
    it('should calculate minimum return date for days', () => {
      const departureDate = '2026-01-16';
      const travelTime = '3 days';
      const result = calculateMinReturnDate(departureDate, travelTime);
      expect(result).toBe('2026-01-19');
    });

    it('should calculate minimum return date for months', () => {
      const departureDate = '2026-01-16';
      const travelTime = '1 month';
      const result = calculateMinReturnDate(departureDate, travelTime);
      // 30 days from Jan 16 = Feb 15
      expect(result).toBe('2026-02-15');
    });

    it('should calculate minimum return date for years', () => {
      const departureDate = '2026-01-16';
      const travelTime = '1 year';
      const result = calculateMinReturnDate(departureDate, travelTime);
      expect(result).toBe('2027-01-16');
    });

    it('should return empty string for invalid departure date', () => {
      const result = calculateMinReturnDate('', '3 days');
      expect(result).toBe('');
    });

    it('should handle month boundaries correctly', () => {
      const departureDate = '2026-01-31';
      const travelTime = '1 month';
      const result = calculateMinReturnDate(departureDate, travelTime);
      // Jan 31 + 30 days = March 2 (Feb has 28 days in 2026)
      expect(result).toBe('2026-03-02');
    });
  });
});
