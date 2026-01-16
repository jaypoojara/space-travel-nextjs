'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BookingFormData, BookingResponse } from '@/types/booking';
import { validateBookingForm, validateStep } from '@/lib/validation';
import { saveBookingData, loadBookingData, clearBookingData } from '@/lib/storage';
import { useBookingValidation } from '@/hooks/useBookingValidation';
import { TOTAL_STEPS } from '@/constants/booking';
import { generateTravelerId } from '@/utils/idGenerator';

/**
 * Creates initial form data with a new traveler
 */
function createInitialFormData(): BookingFormData {
  return {
    destination: null,
    departureDate: '',
    returnDate: '',
    travelers: [
      {
        id: generateTravelerId(),
        fullName: '',
        age: 0,
      },
    ],
  };
}

/**
 * Custom hook that encapsulates all booking wizard state and logic
 */
export function useBookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStepParam = searchParams.get('step');

  // Initialize form data from sessionStorage on mount (handles refresh scenario)
  const [formData, setFormData] = useState<BookingFormData>(() => {
    if (typeof window !== 'undefined') {
      const persisted = loadBookingData();
      if (persisted) {
        return persisted;
      }
    }
    return createInitialFormData();
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { isStep1Complete, isStep2Complete } = useBookingValidation();

  // Use ref to avoid stale closure in useEffect
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Initialize from URL and persisted state with route validation
  useEffect(() => {
    const step = currentStepParam ? parseInt(currentStepParam, 10) : 1;
    if (step < 1 || step > TOTAL_STEPS) return;

    // Always try to load persisted data (handles refresh scenario)
    const persisted = loadBookingData();

    // If navigating to step 1 with no persisted data, it's a new booking - reset everything
    if (!persisted && step === 1) {
      setFormData(createInitialFormData());
      setValidationErrors({});
      setBookingId(null);
      setSubmitError(null);
    } else if (persisted) {
      // Load persisted data and clear bookingId (we're returning to form, not confirmation)
      setFormData(persisted);
      setBookingId(null);
    }

    // Use persisted data for validation, fallback to current formData via ref
    const dataToValidate = persisted || formDataRef.current;

    // Validate route access - check if previous steps are complete
    let allowedStep = step;

    if (step === 2 && !isStep1Complete(dataToValidate)) {
      // Step 1 not complete, redirect to step 1
      allowedStep = 1;
      router.replace('/booking?step=1', { scroll: false });
    } else if (step === 3) {
      if (!isStep1Complete(dataToValidate)) {
        // Step 1 not complete, redirect to step 1
        allowedStep = 1;
        router.replace('/booking?step=1', { scroll: false });
      } else if (!isStep2Complete(dataToValidate)) {
        // Step 2 not complete, redirect to step 2
        allowedStep = 2;
        router.replace('/booking?step=2', { scroll: false });
      }
    }

    setCurrentStep(allowedStep);
  }, [currentStepParam, router, isStep1Complete, isStep2Complete]);

  // Persist form data whenever it changes
  useEffect(() => {
    saveBookingData(formData);
  }, [formData]);

  // Update URL when step changes
  const updateStep = useCallback(
    (newStep: number): void => {
      if (newStep < 1 || newStep > TOTAL_STEPS) return;

      setCurrentStep(newStep);
      router.push(`/booking?step=${newStep}`, { scroll: false });
      setValidationErrors({});
    },
    [router]
  );

  // Update form data
  const handleFormUpdate = useCallback((updates: Partial<BookingFormData>): void => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setValidationErrors({});
  }, []);

  // Handle successful booking
  const handleBookingSuccess = useCallback((id: string): void => {
    setBookingId(id);
    // Clear form data after successful booking
    clearBookingData();
  }, []);

  // Submit booking
  const handleSubmitBooking = useCallback(async (): Promise<void> => {
    // Perform final validation before submission
    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setSubmitError('Please correct the errors in your booking details.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        destinationId: formData.destination?.id || '',
        destinationName: formData.destination?.name || '',
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        travelers: formData.travelers.map(({ id, ...rest }) => rest),
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      const data: BookingResponse = await response.json();
      if (data.success) {
        handleBookingSuccess(data.bookingId);
      } else {
        throw new Error('Booking submission failed');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, handleBookingSuccess]);

  // Navigate to next step with validation or submit booking
  const handleNext = useCallback((): void => {
    // If on step 3, submit booking
    if (currentStep === TOTAL_STEPS) {
      handleSubmitBooking();
      return;
    }

    // Step-specific validation using Zod (single source of truth)
    if (currentStep === 1) {
      const validation = validateStep(1, {
        destination: formData.destination,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
      });
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }
      updateStep(currentStep + 1);
      return;
    }

    if (currentStep === 2) {
      const validation = validateStep(2, {
        travelers: formData.travelers,
      });
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }
      updateStep(currentStep + 1);
      return;
    }
  }, [currentStep, formData, updateStep, handleSubmitBooking]);

  // Navigate to previous step
  const handlePrevious = useCallback((): void => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  }, [currentStep, updateStep]);

  // Check if next button should be disabled
  const isNextButtonDisabled =
    (currentStep === TOTAL_STEPS && isSubmitting) ||
    (currentStep === 1 && !isStep1Complete(formData)) ||
    (currentStep === 2 && !isStep2Complete(formData));

  return {
    formData,
    currentStep,
    validationErrors,
    isSubmitting,
    submitError,
    bookingId,
    isNextButtonDisabled,
    handlers: {
      handleFormUpdate,
      handleNext,
      handlePrevious,
    },
  };
}
