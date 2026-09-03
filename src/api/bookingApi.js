import axiosClient from './axiosClient';

export const bookingApi = {

  init: ({
    hotelId,
    roomId,
    city,
    checkInDate,
    checkOutDate,
    roomCount
  }) =>
    axiosClient
      .post('/bookings/init', {
        hotelId,
        roomId,
        city,
        checkInDate,
        checkOutDate,
        roomCount
      })
      .then((r) => r.data.data),

  addGuests: (bookingId, guests) =>
    axiosClient
      .post(`/bookings/${bookingId}/addGuests`, guests)
      .then((r) => r.data.data),

  initiatePayment: (bookingId) =>
    axiosClient
      .post(`/bookings/${bookingId}/payments`)
      .then((r) => r.data.data),

  verifyPayment: ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  }) =>
    axiosClient
      .post('/bookings/verify-payment', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      })
      .then((r) => r.data.data),

  cancel: (bookingId) =>
    axiosClient
      .delete(`/bookings/${bookingId}`)
      .then((r) => r.data.data),
};