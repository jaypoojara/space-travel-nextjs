/**
 * @jest-environment node
 */
import { POST } from '@/app/api/bookings/route';
import { NextRequest } from 'next/server';

// Mock the delay to speed up tests
jest.mock('@/constants/booking', () => ({
  ...jest.requireActual('@/constants/booking'),
  API_DELAY: { MIN: 0, MAX: 0 },
}));

describe('POST /api/bookings', () => {
  const validPayload = {
    destinationId: 'mars',
    destinationName: 'Mars',
    departureDate: '2026-06-01',
    returnDate: '2027-01-01',
    travelers: [{ fullName: 'John Doe', age: 30 }],
  };

  function createRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  it('should return 200 with booking ID for valid payload', async () => {
    const request = createRequest(validPayload);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.bookingId).toBeDefined();
    expect(data.bookingId).toMatch(/^BK[A-Z0-9]+$/);
  });

  it('should return 400 when destinationId is missing', async () => {
    const { destinationId, ...payloadWithoutDestinationId } = validPayload;
    const request = createRequest(payloadWithoutDestinationId);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid booking data');
    expect(data.details).toBeDefined();
  });

  it('should return 400 when destinationName is missing', async () => {
    const { destinationName, ...payloadWithoutName } = validPayload;
    const request = createRequest(payloadWithoutName);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when departureDate is missing', async () => {
    const { departureDate, ...payloadWithoutDate } = validPayload;
    const request = createRequest(payloadWithoutDate);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when returnDate is missing', async () => {
    const { returnDate, ...payloadWithoutReturn } = validPayload;
    const request = createRequest(payloadWithoutReturn);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when travelers array is empty', async () => {
    const request = createRequest({ ...validPayload, travelers: [] });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid booking data');
  });

  it('should return 400 when traveler has invalid name', async () => {
    const request = createRequest({
      ...validPayload,
      travelers: [{ fullName: 'John', age: 30 }], // Single name, needs first + last
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when traveler has invalid age', async () => {
    const request = createRequest({
      ...validPayload,
      travelers: [{ fullName: 'John Doe', age: 0 }],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when travelers exceed max limit (6 travelers)', async () => {
    const request = createRequest({
      ...validPayload,
      travelers: [
        { fullName: 'John Doe', age: 30 },
        { fullName: 'Jane Doe', age: 28 },
        { fullName: 'Bob Smith', age: 35 },
        { fullName: 'Alice Smith', age: 32 },
        { fullName: 'Charlie Brown', age: 25 },
        { fullName: 'Diana Prince', age: 29 },
      ],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 500 for malformed JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: 'not valid json{',
      headers: { 'Content-Type': 'application/json' },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Internal server error');
  });

  it('should accept multiple valid travelers (up to 5)', async () => {
    const request = createRequest({
      ...validPayload,
      travelers: [
        { fullName: 'John Doe', age: 30 },
        { fullName: 'Jane Doe', age: 28 },
        { fullName: 'Bob Smith', age: 35 },
        { fullName: 'Alice Smith', age: 32 },
        { fullName: 'Charlie Brown', age: 25 },
      ],
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.bookingId).toMatch(/^BK[A-Z0-9]+$/);
  });
});
