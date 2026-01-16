'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { clearBookingData, saveBookingId } from '@/lib/storage';

interface BookingConfirmationProps {
  bookingId: string;
}

/**
 * Success confirmation screen after booking submission
 */
export function BookingConfirmation({ bookingId }: BookingConfirmationProps): JSX.Element {
  const router = useRouter();

  const handleStartNewBooking = (): void => {
    // Save bookingId to history before clearing
    saveBookingId(bookingId);
    // Clear current booking form data
    clearBookingData();
    // Redirect to step 1 for new booking with replace to avoid history entry
    router.replace('/booking?step=1');
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6" role="region" aria-live="polite">
      <div className="mb-8">
        <div
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your space travel booking has been successfully submitted</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <p className="text-sm text-gray-600 mb-2">Booking Reference</p>
        <p
          className="text-2xl font-bold text-blue-900 font-mono"
          aria-label={`Booking ID: ${bookingId}`}
        >
          {bookingId}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Please save this reference number for your records
        </p>
      </Card>

      <div className="pt-6">
        <Button variant="primary" onClick={handleStartNewBooking} aria-label="Start a new booking">
          Start New Booking
        </Button>
      </div>
    </div>
  );
}
