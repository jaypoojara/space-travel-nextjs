import { NextResponse } from 'next/server';
import type { Destination } from '@/types/booking';

/**
 * GET /api/destinations
 * Returns mock destination data
 */
export async function GET(): Promise<NextResponse<Destination[]>> {
  const destinations: Destination[] = [
    { id: 'mars', name: 'Mars', distance: '225M km', travelTime: '7 months' },
    {
      id: 'europa',
      name: 'Europa',
      distance: '628M km',
      travelTime: '2 years',
    },
    { id: 'titan', name: 'Titan', distance: '1.2B km', travelTime: '4 years' },
    {
      id: 'luna',
      name: 'Luna (Moon)',
      distance: '384K km',
      travelTime: '3 days',
    },
  ];

  return NextResponse.json(destinations);
}
