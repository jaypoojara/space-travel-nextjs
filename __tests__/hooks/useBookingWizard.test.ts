import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookingWizard } from '@/hooks/useBookingWizard';
import type { BookingFormData } from '@/types/booking';

// Mock Next.js router
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams('step=1'),
}));

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  saveBookingData: jest.fn(),
  loadBookingData: jest.fn(() => null),
  clearBookingData: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('useBookingWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  it('should initialize with default form data', () => {
    const { result } = renderHook(() => useBookingWizard());

    expect(result.current.formData.destination).toBeNull();
    expect(result.current.formData.departureDate).toBe('');
    expect(result.current.formData.returnDate).toBe('');
    expect(result.current.formData.travelers).toHaveLength(1);
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBeNull();
    expect(result.current.bookingId).toBeNull();
  });

  it('should update form data when handleFormUpdate is called', () => {
    const { result } = renderHook(() => useBookingWizard());

    const destination = {
      id: 'mars',
      name: 'Mars',
      distance: '225M km',
      travelTime: '7 months',
    };

    act(() => {
      result.current.handlers.handleFormUpdate({ destination });
    });

    expect(result.current.formData.destination).toEqual(destination);
  });

  it('should set validation errors when step 1 is incomplete', () => {
    const { result } = renderHook(() => useBookingWizard());

    act(() => {
      result.current.handlers.handleNext();
    });

    // Should have validation errors since form is empty
    expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(0);
  });

  it('should not navigate to next step when validation fails', () => {
    const { result } = renderHook(() => useBookingWizard());

    act(() => {
      result.current.handlers.handleNext();
    });

    // Should still be on step 1
    expect(result.current.currentStep).toBe(1);
  });

  it('should navigate to next step when validation passes', () => {
    const { result } = renderHook(() => useBookingWizard());

    // Fill in valid step 1 data
    const destination = {
      id: 'mars',
      name: 'Mars',
      distance: '225M km',
      travelTime: '7 months',
    };

    act(() => {
      result.current.handlers.handleFormUpdate({
        destination,
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
      });
    });

    act(() => {
      result.current.handlers.handleNext();
    });

    // Should navigate to step 2
    expect(mockPush).toHaveBeenCalledWith('/booking?step=2', { scroll: false });
  });

  it('should navigate to previous step', () => {
    const { result } = renderHook(() => useBookingWizard());

    // Simulate being on step 2
    act(() => {
      result.current.handlers.handleFormUpdate({
        destination: {
          id: 'mars',
          name: 'Mars',
          distance: '225M km',
          travelTime: '7 months',
        },
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
      });
    });

    act(() => {
      result.current.handlers.handleNext();
    });

    mockPush.mockClear();

    act(() => {
      result.current.handlers.handlePrevious();
    });

    expect(mockPush).toHaveBeenCalledWith('/booking?step=1', { scroll: false });
  });

  it('should not navigate before step 1', () => {
    const { result } = renderHook(() => useBookingWizard());

    act(() => {
      result.current.handlers.handlePrevious();
    });

    // Should still be on step 1
    expect(result.current.currentStep).toBe(1);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should clear validation errors when form is updated', () => {
    const { result } = renderHook(() => useBookingWizard());

    // Trigger validation error
    act(() => {
      result.current.handlers.handleNext();
    });

    expect(Object.keys(result.current.validationErrors).length).toBeGreaterThan(0);

    // Update form
    act(() => {
      result.current.handlers.handleFormUpdate({
        departureDate: '2026-06-01',
      });
    });

    // Validation errors should be cleared
    expect(result.current.validationErrors).toEqual({});
  });

  it('should submit booking successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, bookingId: 'BK123456' }),
    });

    const { result } = renderHook(() => useBookingWizard());

    // Fill in complete form data
    const completeFormData: Partial<BookingFormData> = {
      destination: {
        id: 'mars',
        name: 'Mars',
        distance: '225M km',
        travelTime: '7 months',
      },
      departureDate: '2026-06-01',
      returnDate: '2027-01-01',
      travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
    };

    act(() => {
      result.current.handlers.handleFormUpdate(completeFormData);
    });

    // Manually set current step to 3 by navigating through steps
    // First navigate to step 2
    act(() => {
      result.current.handlers.handleNext();
    });

    // Update travelers for step 2
    act(() => {
      result.current.handlers.handleFormUpdate({
        travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
      });
    });

    // Navigate to step 3
    act(() => {
      result.current.handlers.handleNext();
    });

    // Now on step 3, submit
    await act(async () => {
      result.current.handlers.handleNext();
    });

    await waitFor(() => {
      expect(result.current.bookingId).toBe('BK123456');
    });
  });

  it('should handle submission error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useBookingWizard());

    // Fill in complete form data
    act(() => {
      result.current.handlers.handleFormUpdate({
        destination: {
          id: 'mars',
          name: 'Mars',
          distance: '225M km',
          travelTime: '7 months',
        },
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
        travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
      });
    });

    // Navigate to step 2
    act(() => {
      result.current.handlers.handleNext();
    });

    // Navigate to step 3
    act(() => {
      result.current.handlers.handleNext();
    });

    // Submit (on step 3)
    await act(async () => {
      result.current.handlers.handleNext();
    });

    await waitFor(() => {
      expect(result.current.submitError).toBe('Failed to submit booking');
    });
  });

  it('should set isSubmitting to true during submission', async () => {
    let resolvePromise: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useBookingWizard());

    // Fill in complete form data
    act(() => {
      result.current.handlers.handleFormUpdate({
        destination: {
          id: 'mars',
          name: 'Mars',
          distance: '225M km',
          travelTime: '7 months',
        },
        departureDate: '2026-06-01',
        returnDate: '2027-01-01',
        travelers: [{ id: '1', fullName: 'John Doe', age: 30 }],
      });
    });

    // Navigate through steps to step 3
    act(() => {
      result.current.handlers.handleNext();
    });
    act(() => {
      result.current.handlers.handleNext();
    });

    // Start submission (don't await)
    act(() => {
      result.current.handlers.handleNext();
    });

    // Should be submitting
    expect(result.current.isSubmitting).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true, bookingId: 'BK123456' }),
      });
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
