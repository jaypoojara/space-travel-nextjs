import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intergalactic Travel Agency - Space Travel Booking',
  description: 'Book your journey across the cosmos',
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
