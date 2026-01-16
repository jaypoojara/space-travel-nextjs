'use client';

import React, { useCallback } from 'react';
import type { BookingFormData, Traveler } from '@/types/booking';
import { MAX_TRAVELERS, MIN_AGE, MAX_AGE } from '@/constants/booking';
import { generateTravelerId } from '@/utils/idGenerator';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Step2TravelersProps {
  formData: BookingFormData;
  onUpdate: (updates: Partial<BookingFormData>) => void;
  errors: Record<string, string>;
}

/**
 * Step 2: Traveler information management
 */
export const Step2Travelers = React.memo(function Step2Travelers({
  formData,
  onUpdate,
  errors,
}: Step2TravelersProps): JSX.Element {
  const travelers = formData.travelers;

  const addTraveler = useCallback((): void => {
    if (travelers.length >= MAX_TRAVELERS) return;

    const newTraveler: Traveler = {
      id: generateTravelerId(),
      fullName: '',
      age: 0,
    };

    onUpdate({
      travelers: [...travelers, newTraveler],
    });
  }, [travelers, onUpdate]);

  const removeTraveler = useCallback(
    (id: string): void => {
      if (travelers.length <= 1) return;

      onUpdate({
        travelers: travelers.filter((t) => t.id !== id),
      });
    },
    [travelers, onUpdate]
  );

  const updateTraveler = useCallback(
    (id: string, updates: Partial<Omit<Traveler, 'id'>>): void => {
      onUpdate({
        travelers: travelers.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      });
    },
    [travelers, onUpdate]
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Traveler Information</h2>
        <p className="text-gray-600">Add details for all travelers (1-5 travelers required)</p>
      </header>

      <div className="space-y-6" role="list" aria-label="Travelers list">
        {travelers.map((traveler, index) => {
          const travelerErrors = {
            fullName: errors[`travelers.${index}.fullName`],
            age: errors[`travelers.${index}.age`],
          };

          return (
            <Card key={traveler.id} role="listitem">
              <div className="flex items-start justify-between mb-4">
                <h3
                  className="text-lg font-semibold text-gray-900"
                  id={`traveler-${index}-heading`}
                >
                  Traveler {index + 1}
                </h3>
                {travelers.length > 1 && (
                  <Button
                    variant="danger"
                    onClick={() => removeTraveler(traveler.id)}
                    aria-label={`Remove traveler ${index + 1}`}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <fieldset
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                aria-labelledby={`traveler-${index}-heading`}
              >
                <Input
                  label={`Full Name for Traveler ${index + 1}`}
                  type="text"
                  value={traveler.fullName}
                  onChange={(e) => {
                    // Only allow alphabetic characters and spaces
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    updateTraveler(traveler.id, { fullName: value });
                  }}
                  error={travelerErrors.fullName}
                  placeholder="e.g. John Doe"
                  maxLength={100}
                  required
                  aria-label={`Full name for traveler ${index + 1}`}
                />
                <Input
                  label={`Age for Traveler ${index + 1}`}
                  type="number"
                  min={MIN_AGE.toString()}
                  max={MAX_AGE.toString()}
                  value={traveler.age || ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove any non-numeric characters (including +, -, ., e, etc.)
                    value = value.replace(/[^0-9]/g, '');

                    // If empty, set to 0 for validation purposes
                    if (value === '') {
                      updateTraveler(traveler.id, { age: 0 });
                      return;
                    }

                    // Parse and validate range
                    const age = parseInt(value, 10);
                    if (!isNaN(age)) {
                      // Clamp value between 1 and 100
                      const clampedAge = Math.max(MIN_AGE, Math.min(MAX_AGE, age));
                      updateTraveler(traveler.id, { age: clampedAge });
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent non-numeric keys (but allow backspace, delete, arrow keys, etc.)
                    const allowedKeys = [
                      'Backspace',
                      'Delete',
                      'Tab',
                      'Escape',
                      'Enter',
                      'ArrowLeft',
                      'ArrowRight',
                      'ArrowUp',
                      'ArrowDown',
                    ];

                    if (
                      !allowedKeys.includes(e.key) &&
                      !(e.key >= '0' && e.key <= '9') &&
                      !(e.ctrlKey || e.metaKey) // Allow Ctrl+C, Ctrl+V, etc.
                    ) {
                      e.preventDefault();
                    }
                  }}
                  error={travelerErrors.age}
                  placeholder={`${MIN_AGE}-${MAX_AGE}`}
                  required
                  aria-label={`Age for traveler ${index + 1}`}
                />
              </fieldset>
            </Card>
          );
        })}
      </div>

      {travelers.length < MAX_TRAVELERS && (
        <Button
          variant="secondary"
          onClick={addTraveler}
          className="w-full md:w-auto"
          aria-label={`Add another traveler (${travelers.length} of ${MAX_TRAVELERS})`}
        >
          + Add Another Traveler
        </Button>
      )}

      {travelers.length >= MAX_TRAVELERS && (
        <p className="text-sm text-gray-500 italic" role="status" aria-live="polite">
          Maximum of {MAX_TRAVELERS} travelers allowed
        </p>
      )}

      {errors.travelers && (
        <p className="text-red-600 text-sm" role="alert">
          {errors.travelers}
        </p>
      )}
    </div>
  );
});
