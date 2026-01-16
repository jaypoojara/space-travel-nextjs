import { validateBookingForm } from '@/lib/validation';
import type { BookingFormData } from '@/types/booking';

describe('validateBookingForm', () => {
  const validFormData: BookingFormData = {
    destination: {
      id: 'mars',
      name: 'Mars',
      distance: '225M km',
      travelTime: '7 months',
    },
    departureDate: '2026-01-16',
    returnDate: '2026-08-16', // 7 months later
    travelers: [
      {
        id: '1',
        fullName: 'John Doe',
        age: 30,
      },
    ],
  };

  it('should validate a complete and valid form', () => {
    const result = validateBookingForm(validFormData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should fail validation when destination is missing', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      destination: null,
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.destination).toBeDefined();
  });

  it('should fail validation when departure date is missing', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      departureDate: '',
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.departureDate).toBeDefined();
  });

  it('should fail validation when return date is missing', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      returnDate: '',
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.returnDate).toBeDefined();
  });

  it('should fail validation when return date is before departure date', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      departureDate: '2026-01-16',
      returnDate: '2026-01-15',
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.returnDate).toBeDefined();
  });

  it('should fail validation when return date is before departure + travel time', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      destination: {
        id: 'luna',
        name: 'Luna (Moon)',
        distance: '384K km',
        travelTime: '3 days',
      },
      departureDate: '2026-01-16',
      returnDate: '2026-01-18', // Only 2 days later, but travel time is 3 days
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.returnDate).toBeDefined();
  });

  it('should pass validation when return date accounts for travel time', () => {
    const validData: BookingFormData = {
      ...validFormData,
      destination: {
        id: 'luna',
        name: 'Luna (Moon)',
        distance: '384K km',
        travelTime: '3 days',
      },
      departureDate: '2026-01-16',
      returnDate: '2026-01-19', // 3 days later (minimum)
    };
    const result = validateBookingForm(validData);
    expect(result.isValid).toBe(true);
  });

  it('should fail validation when no travelers are provided', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      travelers: [],
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors.travelers).toBeDefined();
  });

  it('should fail validation when traveler name is invalid', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      travelers: [
        {
          id: '1',
          fullName: 'John', // Only one name, needs first + last
          age: 30,
        },
      ],
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors['travelers.0.fullName']).toBeDefined();
  });

  it('should fail validation when traveler age is invalid', () => {
    const invalidData: BookingFormData = {
      ...validFormData,
      travelers: [
        {
          id: '1',
          fullName: 'John Doe',
          age: 0, // Invalid age
        },
      ],
    };
    const result = validateBookingForm(invalidData);
    expect(result.isValid).toBe(false);
    expect(result.errors['travelers.0.age']).toBeDefined();
  });
});
