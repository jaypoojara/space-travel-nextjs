'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Destination, BookingFormData } from '@/types/booking';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateMinReturnDate } from '@/utils/travelTime';

interface Step1DestinationProps {
  formData: BookingFormData;
  onUpdate: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
}

/**
 * Destination grid component with keyboard navigation
 */
interface DestinationGridProps {
  destinations: Destination[];
  selectedId?: string;
  onSelect: (destination: Destination) => void;
}

function DestinationGrid({
  destinations,
  selectedId,
  onSelect,
}: DestinationGridProps): JSX.Element {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(destinations[index]);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % destinations.length;
        onSelect(destinations[nextIndex]);
        cardRefs.current[nextIndex]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + destinations.length) % destinations.length;
        onSelect(destinations[prevIndex]);
        cardRefs.current[prevIndex]?.focus();
      }
    },
    [destinations, onSelect]
  );

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      role="radiogroup"
      aria-labelledby="destination-heading"
      aria-required="true"
    >
      {destinations.map((destination, index) => {
        const isSelected = selectedId === destination.id;
        return (
          <Card
            key={destination.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className={`
              cursor-pointer transition-all duration-200
              ${isSelected ? 'ring-4 ring-blue-500 border-blue-600' : 'hover:shadow-lg'}
            `}
            onClick={() => onSelect(destination)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Select ${destination.name} as destination`}
            tabIndex={isSelected ? 0 : -1}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Distance:</span> {destination.distance}
              </p>
              <p>
                <span className="font-semibold">Travel Time:</span> {destination.travelTime}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Step 1: Destination selection and date selection
 */
export function Step1Destination({
  formData,
  onUpdate,
  errors,
}: Step1DestinationProps): JSX.Element {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/destinations');
      if (!response.ok) throw new Error('Failed to fetch destinations');
      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const today = new Date().toISOString().split('T')[0];

  // Calculate minimum return date based on departure date + travel time
  let minReturnDate = today;
  if (formData.departureDate && formData.destination?.travelTime) {
    const calculatedMin = calculateMinReturnDate(
      formData.departureDate,
      formData.destination.travelTime
    );
    if (calculatedMin) {
      minReturnDate = calculatedMin;
    } else if (new Date(formData.departureDate) > new Date()) {
      minReturnDate = formData.departureDate;
    }
  } else if (formData.departureDate && new Date(formData.departureDate) > new Date()) {
    minReturnDate = formData.departureDate;
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 id="destination-heading" className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Destination
        </h2>
        <p className="text-gray-600">Choose where you want to travel in the cosmos</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="status" aria-live="polite">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32" aria-hidden="true" />
          ))}
        </div>
      ) : error ? (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-800 mb-3">{error}</p>
          <Button onClick={fetchDestinations} variant="secondary">
            Retry
          </Button>
        </div>
      ) : (
        <DestinationGrid
          destinations={destinations}
          selectedId={formData.destination?.id}
          onSelect={(destination) => onUpdate({ destination })}
        />
      )}

      {errors.destination && (
        <p className="text-red-600 text-sm" role="alert" id="destination-error">
          {errors.destination}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Input
          label="Departure Date"
          type="date"
          value={formData.departureDate}
          min={today}
          onChange={(e) => onUpdate({ departureDate: e.target.value })}
          error={errors.departureDate}
          required
        />
        <Input
          label="Return Date"
          type="date"
          value={formData.returnDate}
          min={minReturnDate}
          onChange={(e) => onUpdate({ returnDate: e.target.value })}
          error={errors.returnDate}
          required
        />
      </div>
    </div>
  );
}
