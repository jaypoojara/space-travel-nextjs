'use client';

import { Button } from '@/components/ui/Button';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BookingError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md bg-white p-6 rounded-lg shadow text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Something went wrong 🚨</h2>

        <p className="text-sm text-gray-600">
          We couldn’t load the booking flow. Please try again.
        </p>

        <p className="text-sm text-red-600">Error: {error?.message}</p>

        <Button onClick={() => reset()} variant="primary">
          Try again
        </Button>
      </div>
    </div>
  );
}
