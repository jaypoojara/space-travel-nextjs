/**
 * Core types for the booking wizard
 */

export interface Destination {
  id: string;
  name: string;
  distance: string;
  travelTime: string;
}

export interface Traveler {
  id: string;
  fullName: string;
  age: number;
}

export interface BookingFormData {
  destination: Destination | null;
  departureDate: string;
  returnDate: string;
  travelers: Traveler[];
}

export interface BookingPayload {
  destinationId: string;
  destinationName: string;
  departureDate: string;
  returnDate: string;
  travelers: Omit<Traveler, 'id'>[];
}

export interface BookingResponse {
  success: boolean;
  bookingId: string;
}

export interface BookingErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}

export interface BookingHistoryEntry {
  bookingId: string;
  createdAt: string;
}
