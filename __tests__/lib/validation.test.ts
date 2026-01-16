import { validateBookingForm, validateStep, travelerSchema, bookingPayloadSchema } from '@/lib/validation';
import type { BookingFormData } from '@/types/booking';
import {
  MIN_AGE,
  MAX_AGE,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  MAX_TRAVELERS,
} from '@/constants/booking';

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

describe('validateBookingForm - Boundary Tests', () => {
  const validFormData: BookingFormData = {
    destination: {
      id: 'mars',
      name: 'Mars',
      distance: '225M km',
      travelTime: '7 months',
    },
    departureDate: '2026-01-16',
    returnDate: '2026-08-16',
    travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
  };

  describe('Traveler Count Limits', () => {
    it('should pass validation with max travelers (5)', () => {
      const dataWithMaxTravelers: BookingFormData = {
        ...validFormData,
        travelers: [
          { id: '1', fullName: 'John Doe', age: 30 },
          { id: '2', fullName: 'Jane Doe', age: 28 },
          { id: '3', fullName: 'Bob Smith', age: 35 },
          { id: '4', fullName: 'Alice Smith', age: 32 },
          { id: '5', fullName: 'Charlie Brown', age: 25 },
        ],
      };
      const result = validateBookingForm(dataWithMaxTravelers);
      expect(result.isValid).toBe(true);
    });

    it('should fail validation when travelers exceed max limit (6)', () => {
      const dataWithTooManyTravelers: BookingFormData = {
        ...validFormData,
        travelers: [
          { id: '1', fullName: 'John Doe', age: 30 },
          { id: '2', fullName: 'Jane Doe', age: 28 },
          { id: '3', fullName: 'Bob Smith', age: 35 },
          { id: '4', fullName: 'Alice Smith', age: 32 },
          { id: '5', fullName: 'Charlie Brown', age: 25 },
          { id: '6', fullName: 'Diana Prince', age: 29 },
        ],
      };
      const result = validateBookingForm(dataWithTooManyTravelers);
      expect(result.isValid).toBe(false);
      expect(result.errors.travelers).toBeDefined();
    });
  });

  describe('Age Boundaries', () => {
    it(`should pass validation at minimum age (${MIN_AGE})`, () => {
      const dataWithMinAge: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'Baby Doe', age: MIN_AGE }],
      };
      const result = validateBookingForm(dataWithMinAge);
      expect(result.isValid).toBe(true);
    });

    it(`should fail validation below minimum age (${MIN_AGE - 1})`, () => {
      const dataWithInvalidAge: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'John Doe', age: MIN_AGE - 1 }],
      };
      const result = validateBookingForm(dataWithInvalidAge);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.age']).toBeDefined();
    });

    it(`should pass validation at maximum age (${MAX_AGE})`, () => {
      const dataWithMaxAge: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'Elder Doe', age: MAX_AGE }],
      };
      const result = validateBookingForm(dataWithMaxAge);
      expect(result.isValid).toBe(true);
    });

    it(`should fail validation above maximum age (${MAX_AGE + 1})`, () => {
      const dataWithInvalidAge: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'John Doe', age: MAX_AGE + 1 }],
      };
      const result = validateBookingForm(dataWithInvalidAge);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.age']).toBeDefined();
    });

    it('should fail validation for non-integer age', () => {
      const dataWithDecimalAge: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'John Doe', age: 25.5 }],
      };
      const result = validateBookingForm(dataWithDecimalAge);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.age']).toBeDefined();
    });
  });

  describe('Name Length Boundaries', () => {
    it(`should fail validation when name part is too short (${NAME_MIN_LENGTH - 1} char)`, () => {
      const dataWithShortName: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'J Doe', age: 30 }], // 'J' is only 1 char
      };
      const result = validateBookingForm(dataWithShortName);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.fullName']).toBeDefined();
    });

    it(`should pass validation when name parts meet minimum length (${NAME_MIN_LENGTH} chars)`, () => {
      const dataWithMinName: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'Jo Do', age: 30 }], // Each part is 2 chars
      };
      const result = validateBookingForm(dataWithMinName);
      expect(result.isValid).toBe(true);
    });

    it(`should fail validation when name part exceeds max length (${NAME_MAX_LENGTH + 1} chars)`, () => {
      const longNamePart = 'A'.repeat(NAME_MAX_LENGTH + 1);
      const dataWithLongName: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: `${longNamePart} Doe`, age: 30 }],
      };
      const result = validateBookingForm(dataWithLongName);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.fullName']).toBeDefined();
    });

    it(`should fail validation when full name exceeds max length (${FULL_NAME_MAX_LENGTH + 1} chars)`, () => {
      // Create a full name that exceeds FULL_NAME_MAX_LENGTH but has valid parts
      const longFullName = 'Abcde '.repeat(Math.ceil((FULL_NAME_MAX_LENGTH + 1) / 6)).trim();
      const dataWithLongFullName: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: longFullName, age: 30 }],
      };
      const result = validateBookingForm(dataWithLongFullName);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.fullName']).toBeDefined();
    });
  });

  describe('Name Character Validation', () => {
    it('should fail validation for names with numbers', () => {
      const dataWithNumbers: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'John Doe123', age: 30 }],
      };
      const result = validateBookingForm(dataWithNumbers);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.fullName']).toBeDefined();
    });

    it('should fail validation for names with special characters', () => {
      const dataWithSpecialChars: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'John@Doe!', age: 30 }],
      };
      const result = validateBookingForm(dataWithSpecialChars);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.fullName']).toBeDefined();
    });

    it('should pass validation for names with spaces', () => {
      const dataWithSpaces: BookingFormData = {
        ...validFormData,
        travelers: [{ id: '1', fullName: 'John Michael Doe', age: 30 }],
      };
      const result = validateBookingForm(dataWithSpaces);
      expect(result.isValid).toBe(true);
    });
  });
});

describe('validateStep', () => {
  describe('Step 1 - Destination Validation', () => {
    it('should pass step 1 with valid destination and dates', () => {
      const step1Data = {
        destination: {
          id: 'mars',
          name: 'Mars',
          distance: '225M km',
          travelTime: '7 months',
        },
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
      };
      const result = validateStep(1, step1Data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail step 1 when destination is null', () => {
      const step1Data = {
        destination: null,
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
      };
      const result = validateStep(1, step1Data);
      expect(result.isValid).toBe(false);
      expect(result.errors.destination).toBeDefined();
    });

    it('should fail step 1 when departure date is empty', () => {
      const step1Data = {
        destination: {
          id: 'mars',
          name: 'Mars',
          distance: '225M km',
          travelTime: '7 months',
        },
        departureDate: '',
        returnDate: '2027-01-01',
      };
      const result = validateStep(1, step1Data);
      expect(result.isValid).toBe(false);
      expect(result.errors.departureDate).toBeDefined();
    });

    it('should fail step 1 when return date is before departure + travel time', () => {
      const step1Data = {
        destination: {
          id: 'luna',
          name: 'Luna (Moon)',
          distance: '384K km',
          travelTime: '3 days',
        },
        departureDate: '2026-01-16',
        returnDate: '2026-01-17', // Only 1 day, but travel time is 3 days
      };
      const result = validateStep(1, step1Data);
      expect(result.isValid).toBe(false);
      expect(result.errors.returnDate).toBeDefined();
    });
  });

  describe('Step 2 - Travelers Validation', () => {
    it('should pass step 2 with valid travelers', () => {
      const step2Data = {
        travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
      };
      const result = validateStep(2, step2Data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail step 2 with empty travelers', () => {
      const step2Data = {
        travelers: [],
      };
      const result = validateStep(2, step2Data);
      expect(result.isValid).toBe(false);
      expect(result.errors.travelers).toBeDefined();
    });

    it('should fail step 2 with invalid traveler data', () => {
      const step2Data = {
        travelers: [{ id: '1', fullName: 'John', age: 30 }], // Single name
      };
      const result = validateStep(2, step2Data);
      expect(result.isValid).toBe(false);
      expect(result.errors['travelers.0.fullName']).toBeDefined();
    });
  });

  describe('Step 3 and beyond', () => {
    it('should always pass for step 3 (review step)', () => {
      const result = validateStep(3, {});
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should always pass for invalid step numbers', () => {
      const result = validateStep(99, {});
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });
});

describe('bookingPayloadSchema', () => {
  const validPayload = {
    destinationId: 'mars',
    destinationName: 'Mars',
    departureDate: '2026-06-01',
    returnDate: '2027-01-01',
    travelers: [{ fullName: 'John Doe', age: 30 }],
  };

  it('should pass validation for valid payload', () => {
    const result = bookingPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('should fail validation when destinationId is missing', () => {
    const { destinationId, ...payloadWithoutId } = validPayload;
    const result = bookingPayloadSchema.safeParse(payloadWithoutId);
    expect(result.success).toBe(false);
  });

  it('should fail validation when destinationId is empty', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      destinationId: '',
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation when destinationName is missing', () => {
    const { destinationName, ...payloadWithoutName } = validPayload;
    const result = bookingPayloadSchema.safeParse(payloadWithoutName);
    expect(result.success).toBe(false);
  });

  it('should fail validation when destinationName is empty', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      destinationName: '',
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation when departureDate is missing', () => {
    const { departureDate, ...payloadWithoutDate } = validPayload;
    const result = bookingPayloadSchema.safeParse(payloadWithoutDate);
    expect(result.success).toBe(false);
  });

  it('should fail validation when returnDate is missing', () => {
    const { returnDate, ...payloadWithoutReturn } = validPayload;
    const result = bookingPayloadSchema.safeParse(payloadWithoutReturn);
    expect(result.success).toBe(false);
  });

  it('should fail validation when travelers array is empty', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [],
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation when travelers array is missing', () => {
    const { travelers, ...payloadWithoutTravelers } = validPayload;
    const result = bookingPayloadSchema.safeParse(payloadWithoutTravelers);
    expect(result.success).toBe(false);
  });

  it('should fail validation when traveler has invalid name (single name)', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [{ fullName: 'John', age: 30 }],
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation when traveler has invalid age', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [{ fullName: 'John Doe', age: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation when travelers exceed max limit (6)', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [
        { fullName: 'John Doe', age: 30 },
        { fullName: 'Jane Doe', age: 28 },
        { fullName: 'Bob Smith', age: 35 },
        { fullName: 'Alice Smith', age: 32 },
        { fullName: 'Charlie Brown', age: 25 },
        { fullName: 'Diana Prince', age: 29 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('should pass validation with max travelers (5)', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [
        { fullName: 'John Doe', age: 30 },
        { fullName: 'Jane Doe', age: 28 },
        { fullName: 'Bob Smith', age: 35 },
        { fullName: 'Alice Smith', age: 32 },
        { fullName: 'Charlie Brown', age: 25 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should fail validation when traveler name has numbers', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [{ fullName: 'John Doe123', age: 30 }],
    });
    expect(result.success).toBe(false);
  });

  it('should fail validation when traveler age is not an integer', () => {
    const result = bookingPayloadSchema.safeParse({
      ...validPayload,
      travelers: [{ fullName: 'John Doe', age: 25.5 }],
    });
    expect(result.success).toBe(false);
  });
});
