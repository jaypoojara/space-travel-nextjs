import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Step1Destination } from '@/components/booking/Step1Destination';
import type { BookingFormData } from '@/types/booking';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Step1Destination', () => {
  const mockFormData: BookingFormData = {
    destination: null,
    departureDate: '',
    returnDate: '',
    travelers: [
      {
        id: '1',
        fullName: '',
        age: 0,
      },
    ],
  };

  const mockOnUpdate = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render destinations after loading', async () => {
    const mockDestinations = [
      {
        id: 'mars',
        name: 'Mars',
        distance: '225M km',
        travelTime: '7 months',
      },
      {
        id: 'luna',
        name: 'Luna (Moon)',
        distance: '384K km',
        travelTime: '3 days',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDestinations,
    });

    render(
      <Step1Destination formData={mockFormData} onUpdate={mockOnUpdate} errors={mockErrors} />
    );

    await waitFor(() => {
      expect(screen.getByText('Mars')).toBeDefined();
      expect(screen.getByText('Luna (Moon)')).toBeDefined();
    });
  });

  it('should display error message and retry button on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <Step1Destination formData={mockFormData} onUpdate={mockOnUpdate} errors={mockErrors} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load destinations/)).toBeDefined();
      expect(screen.getByText('Retry')).toBeDefined();
    });
  });

  it('should call onUpdate when destination is selected', async () => {
    const mockDestinations = [
      {
        id: 'mars',
        name: 'Mars',
        distance: '225M km',
        travelTime: '7 months',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDestinations,
    });

    render(
      <Step1Destination formData={mockFormData} onUpdate={mockOnUpdate} errors={mockErrors} />
    );

    await waitFor(() => {
      expect(screen.getByText('Mars')).toBeDefined();
    });

    const marsCard = screen.getByText('Mars').closest('div[role="radio"]');
    if (marsCard) {
      fireEvent.click(marsCard as HTMLElement);
      expect(mockOnUpdate).toHaveBeenCalledWith({
        destination: mockDestinations[0],
      });
    }
  });

  it('should show loading skeleton during fetch', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves, keeping loading state
        })
    );

    render(
      <Step1Destination formData={mockFormData} onUpdate={mockOnUpdate} errors={mockErrors} />
    );

    // Check for skeleton loading elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
