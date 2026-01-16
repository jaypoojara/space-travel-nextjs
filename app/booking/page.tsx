'use client';

import { Suspense } from 'react';
import { TOTAL_STEPS } from '@/constants/booking';
import { useBookingWizard } from '@/hooks/useBookingWizard';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { Step1Destination } from '@/components/booking/Step1Destination';
import { Step2Travelers } from '@/components/booking/Step2Travelers';
import { Step3Review } from '@/components/booking/Step3Review';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { Button } from '@/components/ui/Button';

/**
 * Main booking wizard component with URL-driven navigation and state persistence
 */
function BookingWizard(): JSX.Element {
  const {
    formData,
    currentStep,
    validationErrors,
    isSubmitting,
    submitError,
    bookingId,
    handlers,
  } = useBookingWizard();

  // If booking is confirmed, show confirmation screen
  if (bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BookingConfirmation bookingId={bookingId} />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Space Travel Booking</h1>
          <p className="text-gray-600">Book your intergalactic journey in just a few steps</p>
        </header>

        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          {currentStep === 1 && (
            <Step1Destination
              formData={formData}
              onUpdate={handlers.handleFormUpdate}
              errors={validationErrors}
            />
          )}
          {currentStep === 2 && (
            <Step2Travelers
              formData={formData}
              onUpdate={handlers.handleFormUpdate}
              errors={validationErrors}
            />
          )}
          {currentStep === 3 && <Step3Review formData={formData} error={submitError} />}
        </div>

        {submitError && currentStep === 3 && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-800">{submitError}</p>
          </div>
        )}

        <nav className="flex justify-between gap-4" aria-label="Booking navigation">
          <Button
            variant="secondary"
            onClick={handlers.handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
            aria-label={
              currentStep === 1 ? 'Previous step (disabled)' : `Go to step ${currentStep - 1}`
            }
          >
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={handlers.handleNext}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            aria-label={
              currentStep === TOTAL_STEPS ? 'Confirm booking' : `Go to step ${currentStep + 1}`
            }
          >
            {currentStep === TOTAL_STEPS ? 'Confirm Booking' : 'Next'}
          </Button>
        </nav>
      </div>
    </main>
  );
}

/**
 * Main booking wizard page with Suspense boundary for useSearchParams
 */
export default function BookingPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingWizard />
    </Suspense>
  );
}
