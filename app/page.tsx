import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * Home page with navigation to booking wizard
 */
export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Intergalactic Travel Agency</h1>
        <p className="text-xl md:text-2xl mb-4 text-blue-200">
          Your Journey Across the Cosmos Awaits
        </p>
        <p className="text-lg mb-8 text-blue-300">
          Explore Mars, Europa, Titan, and beyond. Book your space travel adventure today.
        </p>
        <Link href="/booking?step=1">
          <Button variant="primary" className="text-blue-900 hover:bg-blue-50 text-lg px-8 py-4">
            Start Booking
          </Button>
        </Link>
      </div>
    </div>
  );
}
