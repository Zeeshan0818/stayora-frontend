import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { authApi } from '../api/authApi';
import {
  setAccessToken,
  setUnauthorizedHandler,
} from '../api/axiosClient';

import {
  decodeJwtPayload,
  getRolesFromToken,
} from '../utils/jwt';

import { setSessionScope } from '../utils/sessionScope';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [token, setToken] = useState(null);

  const [user, setUser] = useState(null);

  // True while we are checking whether the user already
  // has a valid session using the refresh-token cookie.
  const [initializing, setInitializing] = useState(true);


  // --------------------------------------------------
  // APPLY LOGIN SESSION
  // --------------------------------------------------

  const applySession = useCallback((accessToken) => {

    // Store token in axios so that every API request
    // automatically receives:
    //
    // Authorization: Bearer <token>
    //
    setAccessToken(accessToken);

    // Store token in React state.
    setToken(accessToken);


    // These values are only used for displaying user
    // information / determining the role on the frontend.
    let nextEmail = null;
    let nextId = null;
    let roles = [];


    try {

      const payload = decodeJwtPayload(accessToken);

      roles = getRolesFromToken(accessToken);

      if (payload) {

        nextEmail = payload.email ?? null;

        nextId =
          payload.sub != null
            ? Number(payload.sub)
            : null;
      }

    } catch (error) {

      // JWT decoding is only used for frontend information.
      //
      // Even if decoding fails, we STILL keep the token
      // because the backend has already issued it.

      console.warn(
        'Could not decode access token:',
        error
      );
    }


    // Store user information.
    setUser({
      id: nextId,
      email: nextEmail,
      roles,
    });


    // Keep browser-local data separated by account.
    setSessionScope(
      nextEmail ||
      `session:${accessToken.slice(-12)}`
    );

  }, []);


  // --------------------------------------------------
  // CLEAR SESSION / LOGOUT
  // --------------------------------------------------

  const clearSession = useCallback(() => {

    // Remove token from axios.
    setAccessToken(null);

    // Remove token from React state.
    setToken(null);

    // Remove user information.
    setUser(null);

    // Switch local-storage namespace back to guest.
    setSessionScope('guest');

  }, []);


  // --------------------------------------------------
  // RESTORE SESSION WHEN APPLICATION STARTS
  // --------------------------------------------------

  useEffect(() => {

    // If an API request receives a 401 and the refresh
    // token cannot restore the session, clear everything.
    setUnauthorizedHandler(() => {
      clearSession();
    });


    const restoreSession = async () => {

      try {

        // The refresh token is stored in the browser cookie.
        //
        // We use it to get a new access token after a
        // page reload.

        const data = await authApi.refresh();


        if (data?.accessToken) {

          applySession(data.accessToken);

        }

      } catch (error) {

        // This is normal when the user isn't logged in.
        //
        // Do NOT show an error to the user.

        clearSession();

      } finally {

        // VERY IMPORTANT:
        //
        // HotelDetails and other protected pages wait for
        // this to become false before making their API calls.

        setInitializing(false);

      }

    };


    restoreSession();

  }, [applySession, clearSession]);


  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

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


      // Save the newly received access token.
      applySession(data.accessToken);


      return data;

    },
    [applySession]
  );


  // --------------------------------------------------
  // SIGNUP
  // --------------------------------------------------

  const signup = useCallback(
    ({ name, email, password }) => {

      return authApi.signup({
        name,
        email,
        password,
      });

    },
    []
  );


  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = useCallback(() => {

    clearSession();

  }, [clearSession]);


  // --------------------------------------------------
  // ROLE
  // --------------------------------------------------

  const isHotelManager = Boolean(
    user?.roles?.includes('HOTEL_MANAGER')
  );


  // --------------------------------------------------
  // AUTHENTICATION STATUS
  // --------------------------------------------------

  const isAuthenticated = Boolean(token);


  // --------------------------------------------------
  // CONTEXT
  // --------------------------------------------------

  return (
    <AuthContext.Provider
      value={{

        user,

        isAuthenticated,

        isHotelManager,

        // HotelDetails uses this to wait until the
        // refresh-token authentication process is finished.
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


// --------------------------------------------------
// useAuth HOOK
// --------------------------------------------------

export function useAuth() {

  const ctx = useContext(AuthContext);


  if (!ctx) {

    throw new Error(
      'useAuth must be used within an AuthProvider'
    );

  }


  return ctx;
}