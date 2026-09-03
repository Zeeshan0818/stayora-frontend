import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import BookingCard from '../../components/BookingCard';
import { EmptyState } from '../../components/States';
import { getAllBookings } from '../../utils/bookingStore';

export default function Trips() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(getAllBookings());
  }, []);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl">Your trips</h1>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        Trips you book on this device. The backend doesn't yet expose an endpoint to list bookings
        by account, so this list is kept locally rather than shown as account-wide history.
      </p>

      <div className="mt-8">
        {bookings.length === 0 ? (
          <EmptyState
            title="No trips yet."
            description="Your next adventure is waiting."
            actionLabel="Explore stays"
            actionTo="/hotels"
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
