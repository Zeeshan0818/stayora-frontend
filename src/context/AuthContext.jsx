import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, setUnauthorizedHandler } from '../api/axiosClient';
import { decodeJwtPayload, getRolesFromToken } from '../utils/jwt';
import { setSessionScope } from '../utils/sessionScope';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // `token` is the single source of truth for "is there a session at all" —
  // isAuthenticated is derived from THIS, not from whether we successfully
  // decoded its claims. Decoding the JWT client-side is only ever used to
  // populate best-effort display data (email, roles); if it ever fails for
  // any reason, the user must still be treated as logged in (the backend
  // already authenticated them — that's what issued the token), just
  // without a role hint. Conflating "do we have a token" with "did we parse
  // it" was the bug: a decode hiccup could leave a fully logged-in user
  // stuck looking logged-out in the Navbar.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // best-effort: { id, email, roles }
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback((accessToken) => {
    setAccessToken(accessToken); // axios layer — used for the Authorization header
    setToken(accessToken); // React layer — drives isAuthenticated

    let nextEmail = null;
    let nextId = null;
    let roles = [];
    try {
      const payload = decodeJwtPayload(accessToken);
      roles = getRolesFromToken(accessToken);
      if (payload) {
        nextEmail = payload.email ?? null;
        nextId = payload.sub != null ? Number(payload.sub) : null;
      }
    } catch {
      // Decoding is best-effort display data only — a failure here must
      // never undo the fact that we hold a valid access token.
    }

    setUser({ id: nextId, email: nextEmail, roles });
    // Namespace the local trips/host caches to this account so a different
    // user logging in on this browser never sees the previous one's data.
    // Falls back to a stable anonymous-but-authenticated bucket if the
    // email couldn't be read, rather than silently sharing the 'guest' one.
    setSessionScope(nextEmail || `session:${accessToken.slice(-12)}`);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setUser(null);
    // Back to an empty, account-less namespace — the just-logged-out user's
    // local trips/host data is no longer part of the app's active state.
    // It isn't deleted from the browser, only detached: if they log back in
    // as themselves, applySession() above will reattach it by email.
    setSessionScope('guest');
  }, []);

  // On load, try to silently restore a session via the refresh-token cookie.
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());

    (async () => {
      try {
        const data = await authApi.refresh();
        if (data?.accessToken) {
          applySession(data.accessToken);
        }
      } catch {
        // No valid refresh cookie (or not logged in) — that's fine on first load.
      } finally {
        setInitializing(false);
      }
    })();
  }, [applySession, clearSession]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authApi.login({ email, password });
      if (!data?.accessToken) {
        throw new Error('Login response did not include an access token.');
      }
      applySession(data.accessToken);
      return data;
    },
    [applySession]
  );

  const signup = useCallback(({ name, email, password }) => authApi.signup({ name, email, password }), []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const isHotelManager = Boolean(user?.roles?.includes('HOTEL_MANAGER'));

  return (
    <AuthContext.Provider
      value={{
        user,
        // Source of truth: do we hold an access token, full stop. Never
        // gated on whether decoding its claims happened to succeed.
        isAuthenticated: Boolean(token),
        isHotelManager,
        initializing,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
