import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { setAccessToken, setUnauthorizedHandler } from '../api/axiosClient';
import { decodeJwtPayload, getRolesFromToken } from '../utils/jwt';
import { setSessionScope } from '../utils/sessionScope';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // `token` is the single source of truth for "is there a session at all" —
  // isAuthenticated is derived from THIS, not from whether we successfully
  // decoded its claims.
  const [token, setToken] = useState(null);

  // Best-effort: { id, email, roles }
  const [user, setUser] = useState(null);

  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback((accessToken) => {
    setAccessToken(accessToken);
    setToken(accessToken);

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
      // JWT decoding is only used for display information.
      // It should never invalidate an otherwise valid session.
    }

    setUser({
      id: nextId,
      email: nextEmail,
      roles,
    });

    // Keep local data separated between different accounts.
    setSessionScope(
      nextEmail || `session:${accessToken.slice(-12)}`
    );
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setToken(null);
    setUser(null);

    // Return to the guest namespace after logout.
    setSessionScope('guest');
  }, []);

  // Restore session using refresh-token cookie when the app loads.
  useEffect(() => {
    setUnauthorizedHandler(() => clearSession());

    (async () => {
      try {
        const data = await authApi.refresh();

        if (data?.accessToken) {
          applySession(data.accessToken);
        }
      } catch {
        // No valid refresh cookie or user is not logged in.
      } finally {
        setInitializing(false);
      }
    })();
  }, [applySession, clearSession]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authApi.login({
        email,
        password,
      });

      if (!data?.accessToken) {
        throw new Error(
          'Login response did not include an access token.'
        );
      }

      applySession(data.accessToken);

      return data;
    },
    [applySession]
  );

  // ✅ FIX:
  // Role was previously being dropped here.
  const signup = useCallback(
    ({ name, email, password, role }) =>
      authApi.signup({
        name,
        email,
        password,
        role,
      }),
    []
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const isHotelManager = Boolean(
    user?.roles?.includes('HOTEL_MANAGER')
  );

  return (
    <AuthContext.Provider
      value={{
        user,

        // Source of truth for authentication.
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

  if (!ctx) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return ctx;
}