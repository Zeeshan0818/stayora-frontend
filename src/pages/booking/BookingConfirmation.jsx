import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import { getBooking } from '../../utils/bookingStore';
import { formatCurrency, formatDateShort } from '../../utils/format';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(() => getBooking(bookingId));

  useEffect(() => {
    setBooking(getBooking(bookingId));
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <p className="text-ink">We couldn't find that booking on this device.</p>
        <Link to="/hotels" className="btn-outline mt-4 inline-flex">
          Explore stays
        </Link>
      </div>
    );
  }

  // Only ever reached via BookingPayment after bookingApi.verifyPayment()
  // resolved successfully — never set optimistically on the client.
  if (booking.bookingStatus !== 'CONFIRMED') {
    return <Navigate to={`/booking/${bookingId}/payment`} replace />;
  }

  return (
    <div className="container-page max-w-lg py-16 text-center">
      <BookingSteps current={3} />
      <div className="mx-auto mb-5 flex h-16 w-16 animate-[fadeIn_0.4s_ease-out] items-center justify-center rounded-full bg-pine-50 text-pine-600">
        <CheckCircle2 size={34} />
      </div>
      <h1 className="text-3xl">Booking confirmed</h1>
      <p className="mt-1 text-muted">Your stay is officially booked.</p>

      <div className="card mt-8 space-y-2 p-6 text-left">
        <h2 className="font-display text-lg text-ink">{booking.hotelName || 'Your stay'}</h2>
        <p className="text-sm text-muted">{booking.city}</p>
        <p className="pt-2 text-sm text-charcoal">
          {formatDateShort(booking.checkinDate)} → {formatDateShort(booking.checkOutDate)}
        </p>
        <p className="text-sm text-charcoal">
          {booking.roomsCount} {booking.roomsCount === 1 ? 'room' : 'rooms'}
        </p>
        <p className="text-sm text-muted">Booking #{booking.id}</p>
        <p className="pt-3 font-display text-2xl text-ink">{formatCurrency(booking.amount)}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to={`/trips/${booking.id}`} className="btn-outline flex-1">
          View booking
        </Link>
        <Link to="/hotels" className="btn-primary flex-1">
          Explore more stays
        </Link>
      </div>
    </div>
  );
}
