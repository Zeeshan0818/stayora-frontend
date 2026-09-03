import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, CreditCard, RefreshCcw } from 'lucide-react';
import BookingSteps from '../../components/BookingSteps';
import DynamicPricingBadge from '../../components/DynamicPricingBadge';
import { bookingApi } from '../../api/bookingApi';
import { toFriendlyError } from '../../api/axiosClient';
import { getBooking, upsertBooking } from '../../utils/bookingStore';
import { formatCurrency } from '../../utils/format';
import { openRazorpayCheckout, parseRazorpayOrder } from '../../utils/razorpay';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function BookingPayment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const booking = getBooking(bookingId);

  const [status, setStatus] = useState('idle'); // idle | initiating | awaiting | verifying | failed
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const runCheckout = (razorpayOrder) => {
    setStatus('awaiting');
    openRazorpayCheckout({
      order: razorpayOrder,
      keyId: RAZORPAY_KEY_ID,
      name: 'Stayora',
      description: booking?.hotelName ? `Stay at ${booking.hotelName}` : 'Stay booking',
      prefillEmail: user?.email,
      onSuccess: async (verification) => {
        setStatus('verifying');
        try {
          // The backend's response text itself IS the confirmation — we only
          // mark the booking confirmed after this call succeeds.
          await bookingApi.verifyPayment(verification);
          upsertBooking({ id: bookingId, bookingStatus: 'CONFIRMED' });
          toast.success('Payment verified — your stay is booked.');
          navigate(`/booking/${bookingId}/confirmation`);
        } catch (err) {
          setStatus('failed');
          setError(toFriendlyError(err));
        }
      },
      onDismiss: () => {
        setStatus('failed');
        setError('Payment was not completed. You can try again below.');
      },
      onError: (err) => {
        setStatus('failed');
        setError(err.message || 'Payment failed.');
      },
    });
  };

  const handlePayNow = async () => {
    setError('');
    setStatus('initiating');
    try {
      const { sessionUrl } = await bookingApi.initiatePayment(bookingId);
      const razorpayOrder = parseRazorpayOrder(sessionUrl);
      if (!razorpayOrder) {
        throw new Error('Could not read the payment session returned by the server.');
      }
      setOrder(razorpayOrder);
      runCheckout(razorpayOrder);
    } catch (err) {
      setStatus('failed');
      setError(toFriendlyError(err));
    }
  };

  // Retrying after a dismissed/failed attempt reopens the SAME Razorpay
  // order instead of calling POST /payments again — the backend only allows
  // that call once per booking (it requires bookingStatus == GUEST_ADDED,
  // and flips it to PENDING on the first call), so a second call to
  // initiatePayment would fail server-side. See README.
  const handleRetry = () => {
    setError('');
    if (order) {
      runCheckout(order);
    } else {
      handlePayNow();
    }
  };

  if (!booking) {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <BookingSteps current={2} />
        <p className="text-ink">We couldn't find this booking on this device.</p>
        <p className="mt-2 text-sm text-muted">
          The backend doesn't yet support looking up a booking by id, so payment details are only
          available in the browser that created the booking.
        </p>
      </div>
    );
  }

  return (
    <div className="container-page max-w-lg py-12">
      <BookingSteps current={2} />
      <h1 className="text-2xl">Confirm and pay</h1>
      <p className="mt-1 text-sm text-muted">Your card is charged only after Razorpay confirms the payment.</p>

      <div className="card mt-6 space-y-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Stay</span>
          <span className="text-sm font-medium text-ink">{booking.hotelName || 'Your stay'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Room</span>
          <span className="text-sm font-medium text-ink">{booking.roomType || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Dates</span>
          <span className="text-sm font-medium text-ink">
            {booking.checkinDate} → {booking.checkOutDate}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            Total <DynamicPricingBadge />
          </span>
          <span className="font-display text-xl text-ink">{formatCurrency(booking.amount)}</span>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {status === 'failed' ? (
          <button onClick={handleRetry} className="btn-primary w-full">
            <RefreshCcw size={16} />
            Try payment again
          </button>
        ) : (
          <button
            onClick={handlePayNow}
            disabled={status === 'initiating' || status === 'awaiting' || status === 'verifying'}
            className="btn-primary w-full"
          >
            <CreditCard size={16} />
            {status === 'initiating' && 'Preparing payment…'}
            {status === 'awaiting' && 'Waiting for Razorpay…'}
            {status === 'verifying' && 'Verifying payment…'}
            {status === 'idle' && `Pay ${formatCurrency(booking.amount)}`}
          </button>
        )}
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <ShieldCheck size={13} />
          Secured by Razorpay. Verified server-side before confirmation.
        </p>
      </div>
    </div>
  );
}
