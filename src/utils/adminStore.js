// RoomAdminController exposes GET /admin/hotels/{hotelId}/rooms (list rooms
// for one hotel), but HotelController has no equivalent "list my hotels"
// endpoint — only create, get-by-id, update, delete and activate. So the
// dashboard can't ask the backend "which hotels do I own?". We keep a
// device-local registry of hotel ids this browser has created, and use the
// real GET /admin/hotels/{id} to refresh each one's current data. Add a
// GET /admin/hotels (scoped to the authenticated owner) to the backend to
// replace this.
//
// Namespaced per signed-in account (see sessionScope.js) so a different
// host logging in on this browser never sees another owner's hotel ids.

import { getSessionScope } from './sessionScope';

const BASE_KEY = 'stayora.myHotelIds.v1';

function storageKey() {
  return `${BASE_KEY}::${getSessionScope()}`;
}

function readIds() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function rememberHotelId(id) {
  const ids = readIds();
  if (!ids.includes(id)) {
    ids.push(id);
    try {
      localStorage.setItem(storageKey(), JSON.stringify(ids));
    } catch {
      // ignore
    }
  }
}

export function forgetHotelId(id) {
  const ids = readIds().filter((i) => i !== id);
  try {
    localStorage.setItem(storageKey(), JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function getMyHotelIds() {
  return readIds();
}
