import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BookingSteps from '../../components/BookingSteps';
import GuestForm, { validateGuests } from '../../components/GuestForm';
import { bookingApi } from '../../api/bookingApi';
import { toFriendlyError } from '../../api/axiosClient';
import { getBooking, upsertBooking } from '../../utils/bookingStore';

export default function BookingGuests() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const cached = getBooking(bookingId);
  const roomCount = location.state?.roomCount || cached?.roomsCount || 1;

  const [guests, setGuests] = useState(() =>
    Array.from({ length: roomCount }, () => ({ name: '', gender: 'MALE', age: '' }))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => validateGuests(guests), [guests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (errors.length) {
      setError(errors[0]);
      return;
    }
    setSubmitting(true);
    try {
      const payload = guests.map((g) => ({ name: g.name.trim(), gender: g.gender, age: Number(g.age) }));
      const booking = await bookingApi.addGuests(bookingId, payload);
      upsertBooking({
        id: booking.id,
        bookingStatus: booking.bookingStatus,
        guests: Array.from(booking.guests || []),
        amount: booking.amount,
      });
      navigate(`/booking/${bookingId}/payment`, { state: location.state });
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page max-w-2xl py-12">
      <BookingSteps current={1} />
      <h1 className="text-2xl">Who's staying?</h1>
      <p className="mt-1 text-sm text-muted">
        Add details for each guest. This helps the hotel prepare for your arrival.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <GuestForm guests={guests} onChange={setGuests} minGuests={1} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Saving guests…' : 'Continue to payment'}
        </button>
      </form>
    </div>
  );
}
