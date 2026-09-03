import { Link } from 'react-router-dom';
import { MapPin, Users2, BedDouble } from 'lucide-react';
import { formatDateShort, formatCurrency } from '../utils/format';
import { bookingStatusLabel, bookingStatusTone } from '../utils/status';

export default function BookingCard({ booking }) {
  return (
    <Link
      to={`/trips/${booking.id}`}
      className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg text-ink">{booking.hotelName || 'Your stay'}</h3>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${bookingStatusTone(
              booking.bookingStatus
            )}`}
          >
            {bookingStatusLabel(booking.bookingStatus)}
          </span>
        </div>
        {booking.city && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin size={13} /> {booking.city}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal">
          <span>
            {formatDateShort(booking.checkinDate)} → {formatDateShort(booking.checkOutDate)}
          </span>
          <span className="inline-flex items-center gap-1 text-muted">
            <BedDouble size={14} /> {booking.roomsCount} {booking.roomsCount === 1 ? 'room' : 'rooms'}
          </span>
          {booking.guests?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-muted">
              <Users2 size={14} /> {booking.guests.length} guests
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="font-display text-xl text-ink">{formatCurrency(booking.amount)}</p>
        <p className="text-xs font-semibold text-pine-600">View details →</p>
      </div>
    </Link>
  );
}
