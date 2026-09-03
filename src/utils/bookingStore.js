// The backend does not expose a way to list a user's bookings or fetch a
// single booking by id (HotelBookingController only has POST /init,
// POST /{id}/addGuests, POST /{id}/payments, POST /verify-payment and
// DELETE /{id} — see repository/BookingRepository.java, which has no
// corresponding controller GET methods). Every one of those calls DOES
// return real backend data (a BookingDto, or a verified-payment result),
// so rather than inventing a GET /bookings endpoint that doesn't exist,
// we keep a device-local trip history built entirely from those real
// responses. Add GET /bookings/me and GET /bookings/{id} to the backend
// to replace this with a real server-side history.
//
// This history is namespaced per signed-in account (see sessionScope.js)
// so logging out and logging in as someone else on the same browser never
// shows the previous account's trips.

import { getSessionScope } from './sessionScope';

const BASE_KEY = 'stayora.bookings.v1';

function storageKey() {
  return `${BASE_KEY}::${getSessionScope()}`;
}

function readAll() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(map));
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — fail silently.
  }
}

export function upsertBooking(partial) {
  if (!partial?.id) return;
  const all = readAll();
  all[partial.id] = { ...all[partial.id], ...partial };
  writeAll(all);
}

export function getBooking(id) {
  const all = readAll();
  return all[id] || null;
}

export function getAllBookings() {
  const all = readAll();
  return Object.values(all).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function setBookingStatus(id, bookingStatus) {
  const all = readAll();
  if (all[id]) {
    all[id].bookingStatus = bookingStatus;
    writeAll(all);
  }
}
