import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BookingSteps from '../../components/BookingSteps';
import { ErrorState, PageSpinner } from '../../components/States';
import { bookingApi } from '../../api/bookingApi';
import { toFriendlyError } from '../../api/axiosClient';
import { upsertBooking } from '../../utils/bookingStore';

export default function BookingStart() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  const hotelId = params.get('hotelId');
  const roomId = params.get('roomId');
  const city = params.get('city');
  const checkInDate = params.get('checkInDate');
  const checkOutDate = params.get('checkOutDate');
  const roomCount = Number(params.get('roomCount')) || 1;
  const extra = location.state || {};

  useEffect(() => {
    if (!hotelId || !roomId || !city || !checkInDate || !checkOutDate) {
      setError('Missing booking details. Please start again from the hotel page.');
      return;
    }
    if (startedRef.current) return; // guards against React StrictMode double-invoke
    startedRef.current = true;

    bookingApi
      .init({
        hotelId: Number(hotelId),
        roomId: Number(roomId),
        city,
        checkInDate,
        checkOutDate,
        roomCount,
      })
      .then((booking) => {
        upsertBooking({
          id: booking.id,
          hotelName: extra.hotelName,
          roomType: extra.roomType,
          city,
          checkinDate: booking.checkinDate,
          checkOutDate: booking.checkOutDate,
          roomsCount: booking.roomsCount,
          amount: booking.amount,
          bookingStatus: booking.bookingStatus,
          guests: booking.guests || [],
          createdAt: booking.createdAt || new Date().toISOString(),
        });
        navigate(`/booking/${booking.id}/guests`, {
          replace: true,
          state: { ...extra, roomCount },
        });
      })
      .catch((err) => setError(toFriendlyError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="container-page py-16">
        <BookingSteps current={0} />
        <ErrorState message={error} onRetry={() => navigate('/hotels')} />
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <BookingSteps current={0} />
      <PageSpinner />
      <p className="text-center text-sm text-muted">Reserving your room…</p>
    </div>
  );
}
