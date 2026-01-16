import React from 'react';
import type { BookingFormData } from '@/types/booking';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/dateFormat';

interface Step3ReviewProps {
  formData: BookingFormData;
  error?: string | null;
}

/**
 * Step 3: Review and confirm booking
 */
export const Step3Review = React.memo(function Step3Review({
  formData,
  error,
}: Step3ReviewProps): JSX.Element {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
        <p className="text-gray-600">Please review your booking details before confirming</p>
      </header>

      <section aria-labelledby="destination-heading">
        <Card>
          <h3 id="destination-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Destination
          </h3>
          {formData.destination && (
            <dl className="space-y-2 text-gray-700">
              <div>
                <dt className="font-semibold inline">Name:</dt>
                <dd className="inline ml-2">{formData.destination.name}</dd>
              </div>
              <div>
                <dt className="font-semibold inline">Distance:</dt>
                <dd className="inline ml-2">{formData.destination.distance}</dd>
              </div>
              <div>
                <dt className="font-semibold inline">Travel Time:</dt>
                <dd className="inline ml-2">{formData.destination.travelTime}</dd>
              </div>
            </dl>
          )}
        </Card>
      </section>

      <section aria-labelledby="travel-dates-heading">
        <Card>
          <h3 id="travel-dates-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Travel Dates
          </h3>
          <dl className="space-y-2 text-gray-700">
            <div>
              <dt className="font-semibold inline">Departure:</dt>
              <dd className="inline ml-2">{formatDate(formData.departureDate)}</dd>
            </div>
            <div>
              <dt className="font-semibold inline">Return:</dt>
              <dd className="inline ml-2">{formatDate(formData.returnDate)}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section aria-labelledby="travelers-heading">
        <Card>
          <h3 id="travelers-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Travelers ({formData.travelers.length})
          </h3>
          <ul className="space-y-3 text-gray-700" role="list">
            {formData.travelers.map((traveler, index) => (
              <li key={traveler.id} className="pb-3 border-b border-gray-200 last:border-0">
                <dl>
                  <div>
                    <dt className="font-semibold inline">Traveler {index + 1}:</dt>
                    <dd className="inline ml-2">{traveler.fullName}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Age:</dt>
                    <dd className="inline ml-2">{traveler.age}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
});
