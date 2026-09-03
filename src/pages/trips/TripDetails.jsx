import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';
import Modal from '../../components/Modal';
import { EmptyState } from '../../components/States';
import { bookingApi } from '../../api/bookingApi';
import { toFriendlyError } from '../../api/axiosClient';
import { getBooking, setBookingStatus } from '../../utils/bookingStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { bookingStatusLabel, bookingStatusTone } from '../../utils/status';
import { useToast } from '../../context/ToastContext';

const TIMELINE = ['RESERVED', 'GUEST_ADDED', 'PAYMENT_PENDING', 'CONFIRMED'];

export default function TripDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [booking, setBooking] = useState(() => getBooking(bookingId));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    setBooking(getBooking(bookingId));
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="We couldn't find that booking on this device"
          description="The backend doesn't currently support looking up a booking by id from another device or browser."
          actionLabel="Back to trips"
          actionTo="/trips"
        />
      </div>
    );
  }

  const currentStepIndex = TIMELINE.indexOf(booking.bookingStatus);
  const isCancellable = booking.bookingStatus === 'CONFIRMED';

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      await bookingApi.cancel(bookingId);
      setBookingStatus(bookingId, 'CANCELLED');
      setBooking(getBooking(bookingId));
      setShowCancelModal(false);
      toast.success('Booking cancelled successfully');
    } catch (err) {
      setCancelError(toFriendlyError(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">{booking.hotelName || 'Your stay'}</h1>
          {booking.city && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin size={14} /> {booking.city}
            </p>
          )}
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${bookingStatusTone(
            booking.bookingStatus
          )}`}
        >
          {bookingStatusLabel(booking.bookingStatus)}
        </span>
      </div>

      <div className="card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <Stat label="Booking ID" value={`#${booking.id}`} />
        <Stat label="Check-in" value={formatDate(booking.checkinDate)} />
        <Stat label="Check-out" value={formatDate(booking.checkOutDate)} />
        <Stat label="Amount" value={formatCurrency(booking.amount)} />
      </div>

      {booking.guests?.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="font-display text-lg text-ink">Guests</h2>
          <ul className="mt-3 divide-y divide-line">
            {booking.guests.map((g, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-charcoal">{g.name}</span>
                <span className="text-muted">
                  {g.gender?.charAt(0)}
                  {g.gender?.slice(1).toLowerCase()} · {g.age}y
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card mt-6 p-5">
        <h2 className="font-display text-lg text-ink">Status timeline</h2>
        <ol className="mt-4 space-y-4">
          {TIMELINE.map((step, i) => {
            const reached = booking.bookingStatus === 'CANCELLED' ? false : i <= currentStepIndex;
            return (
              <li key={step} className="flex items-center gap-3">
                {reached ? (
                  <CheckCircle2 size={18} className="text-pine-600" />
                ) : (
                  <Circle size={18} className="text-line" />
                )}
                <span className={`text-sm ${reached ? 'text-ink font-medium' : 'text-muted'}`}>
                  {timelineLabel(step)}
                </span>
              </li>
            );
          })}
          {booking.bookingStatus === 'CANCELLED' && (
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">Booking cancelled</span>
            </li>
          )}
        </ol>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/trips" className="btn-outline flex-1">
          Back to trips
        </Link>
        {isCancellable && (
          <button onClick={() => setShowCancelModal(true)} className="btn-danger flex-1">
            Cancel booking
          </button>
        )}
      </div>

      <Modal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel this booking?"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
              Keep reservation
            </button>
            <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel booking'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to cancel this reservation? This can't be undone.</p>
        {cancelError && <p className="mt-3 text-sm text-red-600">{cancelError}</p>}
      </Modal>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function timelineLabel(step) {
  const map = {
    RESERVED: 'Booking created',
    GUEST_ADDED: 'Guests added',
    PAYMENT_PENDING: 'Payment initiated',
    CONFIRMED: 'Payment verified · Booking confirmed',
  };
  return map[step] || step;
}
