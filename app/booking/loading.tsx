/**
 * Loading state for the booking route
 */
export default function BookingLoading(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="text-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-gray-600">Loading booking wizard...</p>
      </div>
    </div>
  );
}
