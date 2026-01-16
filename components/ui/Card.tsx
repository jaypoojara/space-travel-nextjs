import React, { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Reusable card component for content containers
 */
export const Card = React.memo(
  forwardRef<HTMLDivElement, CardProps>(({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  })
);

Card.displayName = 'Card';
