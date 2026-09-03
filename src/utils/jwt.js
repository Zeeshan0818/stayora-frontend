// Decodes the payload of a JWT without verifying its signature.
// This is only used client-side to read non-sensitive claims (e.g. roles)
// so the UI can hide screens the backend wouldn't allow anyway.
// The backend remains the source of truth for authorization.
export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

// The backend stores roles as a claim like "[HOTEL_MANAGER]" (Set#toString()),
// so we parse it loosely rather than assuming a clean array.
export function getRolesFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.roles) return [];
  if (Array.isArray(payload.roles)) return payload.roles;
  return String(payload.roles)
    .replace(/[[\]]/g, '')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}
