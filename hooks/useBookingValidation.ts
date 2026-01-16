import { useCallback } from 'react';
import type { BookingFormData } from '@/types/booking';
import { validateStep } from '@/lib/validation';

/**
 * Custom hook for booking step validation
 * Uses Zod validation as single source of truth
 */
export function useBookingValidation() {
  const isStep1Complete = useCallback((data: BookingFormData): boolean => {
    const validation = validateStep(1, {
      destination: data.destination,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
    });
    return validation.isValid;
  }, []);

  const isStep2Complete = useCallback((data: BookingFormData): boolean => {
    const validation = validateStep(2, {
      travelers: data.travelers,
    });
    return validation.isValid;
  }, []);

  const getFirstIncompleteStep = useCallback(
    (data: BookingFormData): number => {
      if (!isStep1Complete(data)) return 1;
      if (!isStep2Complete(data)) return 2;
      return 3;
    },
    [isStep1Complete, isStep2Complete]
  );

  return {
    isStep1Complete,
    isStep2Complete,
    getFirstIncompleteStep,
  };
}
