import React from 'react';
import { STEP_LABELS } from '@/constants/booking';

/**
 * Visual indicator for current step in the booking wizard
 */
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = React.memo(function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps): JSX.Element {
  return (
    <nav className="mb-8 w-3/4 max-w-5xl mx-auto px-4" aria-label="Booking progress">
      <ol className="flex items-center w-full" role="list">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <li className="flex flex-col items-center z-10" role="listitem">
              {/* Step circle */}
              <div className="px-2">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      step < currentStep
                        ? 'bg-green-500 text-white'
                        : step === currentStep
                          ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}
                  aria-current={step === currentStep ? 'step' : undefined}
                  aria-label={
                    step < currentStep
                      ? `Step ${step} completed`
                      : step === currentStep
                        ? `Step ${step}, current step`
                        : `Step ${step}`
                  }
                >
                  {step < currentStep ? (
                    <span aria-hidden="true">✓</span>
                  ) : (
                    <span aria-hidden="true">{step}</span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-600">
                {STEP_LABELS[step as keyof typeof STEP_LABELS]?.title || `Step ${step}`}
              </div>
            </li>

            {/* Connector line */}
            {step < totalSteps && (
              <li className="flex-1 h-1 bg-gray-200 mb-6" role="presentation" aria-hidden="true">
                <div
                  className={`h-1 w-full ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {currentStep} of {totalSteps}
      </div>
    </nav>
  );
});
