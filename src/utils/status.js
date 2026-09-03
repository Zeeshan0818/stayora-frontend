// Mirrors the backend's BookingStatus enum (entity/enums/BookingStatus.java)
export const BOOKING_STATUS = {
  RESERVED: 'RESERVED',
  GUEST_ADDED: 'GUEST_ADDED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
};

export function bookingStatusLabel(status) {
  const map = {
    RESERVED: 'Reserved',
    GUEST_ADDED: 'Guests added',
    PAYMENT_PENDING: 'Payment pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    PENDING: 'Pending',
    EXPIRED: 'Expired',
  };
  return map[status] || status || 'Unknown';
}

export function bookingStatusTone(status) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-pine-50 text-pine-700 border-pine-100';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-red-50 text-red-600 border-red-100';
    case 'PAYMENT_PENDING':
    case 'PENDING':
      return 'bg-gold-light/40 text-gold-dark border-gold-light';
    default:
      return 'bg-ink/5 text-ink border-ink/10';
  }
}

// Mirrors entity/enums/Gender.java — the backend only supports these two values.
export const GENDERS = ['MALE', 'FEMALE'];
