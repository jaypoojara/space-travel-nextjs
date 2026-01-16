import { NextRequest, NextResponse } from 'next/server';
import type { BookingResponse, BookingErrorResponse } from '@/types/booking';
import { API_DELAY } from '@/constants/booking';
import { generateBookingId } from '@/utils/idGenerator';
import { bookingPayloadSchema } from '@/lib/validation';

/**
 * POST /api/bookings
 * Accepts booking payload and returns confirmation
 * Includes artificial 1-2 second delay to simulate network latency
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<BookingResponse | BookingErrorResponse>> {
  try {
    const body = await request.json();

    // Validate payload using Zod schema
    const validation = bookingPayloadSchema.safeParse(body);
    if (!validation.success) {
      const errorResponse: BookingErrorResponse = {
        success: false,
        error: 'Invalid booking data',
        details: validation.error.flatten().fieldErrors as Record<string, string[]>,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Artificial delay: 1-2 seconds (only in development)
    const delay =
      process.env.NODE_ENV === 'development'
        ? Math.random() * (API_DELAY.MAX - API_DELAY.MIN) + API_DELAY.MIN
        : 0;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate mock booking ID
    const bookingId = generateBookingId();

    return NextResponse.json({
      success: true,
      bookingId,
    });
  } catch (error) {
    console.error('Booking submission error:', error);
    const errorResponse: BookingErrorResponse = {
      success: false,
      error: 'Internal server error',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
