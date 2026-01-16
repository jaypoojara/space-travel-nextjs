/**
 * Utility functions for parsing and calculating travel time
 */

/**
 * Parses a travel time string (e.g., "3 days", "7 months", "2 years") and converts it to days
 */
export function parseTravelTimeToDays(travelTime: string): number {
  const normalized = travelTime.trim().toLowerCase();

  // Match patterns like "3 days", "7 months", "2 years", etc.
  const match = normalized.match(/^(\d+)\s*(day|days|month|months|year|years)$/);

  if (!match) {
    // If parsing fails, default to 0 days (fallback)
    console.warn(`Unable to parse travel time: ${travelTime}`);
    return 0;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'day':
    case 'days':
      return value;
    case 'month':
    case 'months':
      // Approximate: 30 days per month
      return value * 30;
    case 'year':
    case 'years':
      // Approximate: 365 days per year
      return value * 365;
    default:
      return 0;
  }
}

/**
 * Calculates the minimum return date by adding travel time to the departure date
 */
export function calculateMinReturnDate(departureDate: string, travelTime: string): string {
  if (!departureDate) return '';

  const departure = new Date(departureDate);
  const travelDays = parseTravelTimeToDays(travelTime);

  // Add travel days to departure date
  const minReturnDate = new Date(departure);
  minReturnDate.setDate(minReturnDate.getDate() + travelDays);

  return minReturnDate.toISOString().split('T')[0];
}
