// The backend has no endpoint to fetch the signed-in user's own profile
// (no GET /users/me, and the login response only contains an access token —
// see dto/LoginResponseDto.java). The name is only ever returned once, in
// the signup response (dto/UserDto.java). We cache it locally per email so
// the Profile page has something real to show; add a GET /users/me endpoint
// to the backend to replace this.

const STORAGE_KEY = 'stayora.profileNames.v1';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function cacheName(email, name) {
  if (!email || !name) return;
  const all = readAll();
  all[email.toLowerCase()] = name;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getCachedName(email) {
  if (!email) return null;
  return readAll()[email.toLowerCase()] || null;
}
