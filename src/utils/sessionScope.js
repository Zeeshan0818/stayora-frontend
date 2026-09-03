// bookingStore.js and adminStore.js keep device-local caches as stand-ins
// for backend endpoints that don't exist yet (see README). Those caches
// used to be single global lists, which meant logging out and logging in
// as a different account on the same browser could show one user's trips
// or hotels to another. This module tracks which account's data is
// "current" so those stores can namespace their storage key by account —
// exactly like setAccessToken() tracks the current token for axiosClient.

let currentScope = 'guest';

export function setSessionScope(scope) {
  currentScope = scope || 'guest';
}

export function getSessionScope() {
  return currentScope;
}
