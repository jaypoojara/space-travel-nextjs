import { z } from 'zod';
import type { BookingFormData } from '@/types/booking';
import {
  MIN_AGE,
  MAX_AGE,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
} from '@/constants/booking';
import { parseTravelTimeToDays } from '@/utils/travelTime';

/**
 * Validation schemas using Zod
 */

export const travelerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(FULL_NAME_MAX_LENGTH, `Full name must be less than ${FULL_NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain alphabetic characters and spaces')
    .refine(
      (name) => {
        const trimmed = name.trim();
        const parts = trimmed.split(/\s+/).filter((part) => part.length > 0);
        return parts.length >= 2;
      },
      {
        message: 'Full name must include both first name and last name',
      }
    )
    .refine(
      (name) => {
        const parts = name
          .trim()
          .split(/\s+/)
          .filter((part) => part.length > 0);
        return parts.every(
          (part) => part.length >= NAME_MIN_LENGTH && part.length <= NAME_MAX_LENGTH
        );
      },
      {
        message: `Each name part must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`,
      }
    ),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(MIN_AGE, `Age must be at least ${MIN_AGE}`)
    .max(MAX_AGE, `Age must be at most ${MAX_AGE}`),
});

export const bookingFormSchema = z
  .object({
    destination: z
      .object({
        id: z.string(),
        name: z.string(),
        distance: z.string(),
        travelTime: z.string(),
      })
      .nullable()
      .refine((val) => val !== null, 'Please select a destination'),
    departureDate: z.string().min(1, 'Departure date is required'),
    returnDate: z.string().min(1, 'Return date is required'),
    travelers: z
      .array(travelerSchema)
      .min(1, 'At least one traveler is required')
      .max(5, 'Maximum 5 travelers allowed'),
  })
  .refine(
    (data) => {
      if (!data.departureDate || !data.returnDate) return true;

      const departureDate = new Date(data.departureDate);
      const returnDate = new Date(data.returnDate);

      // return date must be after departure date
      if (returnDate <= departureDate) {
        return false;
      }

      // If destination is selected, account for travel time
      if (data.destination?.travelTime) {
        const travelDays = parseTravelTimeToDays(data.destination.travelTime);
        const minReturnDate = new Date(departureDate);
        minReturnDate.setDate(minReturnDate.getDate() + travelDays);

        // Return date must be after departure + travel time
        return returnDate >= minReturnDate;
      }

      return true;
    },
    (data) => {
      // Custom error message based on whether travel time is involved
      if (data.destination?.travelTime) {
        const travelDays = parseTravelTimeToDays(data.destination.travelTime);
        const departureDate = new Date(data.departureDate);
        const minReturnDate = new Date(departureDate);
        minReturnDate.setDate(minReturnDate.getDate() + travelDays);

        return {
          message: `Return date must be at least ${data.destination.travelTime} after departure date (minimum return date: ${minReturnDate.toLocaleDateString()})`,
          path: ['returnDate'],
        };
      }
      return {
        message: 'Return date must be after departure date',
        path: ['returnDate'],
      };
    }
  );

/**
 * Step-specific validation schemas
 */
const step1Schema = z
  .object({
    destination: z
      .object({
        id: z.string(),
        name: z.string(),
        distance: z.string(),
        travelTime: z.string(),
      })
      .nullable()
      .refine((val) => val !== null, 'Please select a destination'),
    departureDate: z.string().min(1, 'Departure date is required'),
    returnDate: z.string().min(1, 'Return date is required'),
  })
  .refine(
    (data) => {
      if (!data.departureDate || !data.returnDate) return true;
      const departureDate = new Date(data.departureDate);
      const returnDate = new Date(data.returnDate);
      if (returnDate <= departureDate) return false;
      if (data.destination?.travelTime) {
        const travelDays = parseTravelTimeToDays(data.destination.travelTime);
        const minReturnDate = new Date(departureDate);
        minReturnDate.setDate(minReturnDate.getDate() + travelDays);
        return returnDate >= minReturnDate;
      }
      return true;
    },
    (data) => {
      if (data.destination?.travelTime) {
        const travelDays = parseTravelTimeToDays(data.destination.travelTime);
        const departureDate = new Date(data.departureDate);
        const minReturnDate = new Date(departureDate);
        minReturnDate.setDate(minReturnDate.getDate() + travelDays);
        return {
          message: `Return date must be at least ${data.destination.travelTime} after departure date`,
          path: ['returnDate'],
        };
      }
      return {
        message: 'Return date must be after departure date',
        path: ['returnDate'],
      };
    }
  );

const step2Schema = z.object({
  travelers: z
    .array(travelerSchema)
    .min(1, 'At least one traveler is required')
    .max(5, 'Maximum 5 travelers allowed'),
});

/**
 * Validates a specific step of the booking form
 */
export function validateStep(
  step: number,
  data: Partial<BookingFormData>
): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  let schema: z.ZodSchema;
  if (step === 1) {
    schema = step1Schema;
  } else if (step === 2) {
    schema = step2Schema;
  } else {
    return { isValid: true, errors: {} };
  }

  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
}

/**
 * Validates booking form data
 */
export function validateBookingForm(data: BookingFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  try {
    bookingFormSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
}

/**
 * Schema for API payload validation
 */
export const bookingPayloadSchema = z.object({
  destinationId: z.string().min(1, 'Destination ID is required'),
  destinationName: z.string().min(1, 'Destination name is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
  travelers: z
    .array(
      z.object({
        fullName: travelerSchema.shape.fullName,
        age: travelerSchema.shape.age,
      })
    )
    .min(1, 'At least one traveler is required')
    .max(5, 'Maximum 5 travelers allowed'),
});
