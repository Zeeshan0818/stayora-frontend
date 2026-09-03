import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

let accessToken = null;
let onUnauthorized = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Registered by AuthContext so the client can react to a hard logout
// (e.g. refresh failed) without importing React state into this module.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // required so the RefreshToken cookie is sent/received
});

axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        // Multiple concurrent 401s should trigger a single refresh call.
        if (!refreshPromise) {
          refreshPromise = axiosClient
            .post('/auth/refresh')
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        setAccessToken(null);
        onUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function toFriendlyError(error) {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.error?.message;

  if (!error?.response) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  switch (status) {
    case 400:
      return backendMessage || "That didn't look right. Please check the details and try again.";
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "We couldn't find that.";
    case 409:
      return 'That conflicts with an existing record. Please refresh and try again.';
    case 500:
      // The backend's GlobalExceptionHandler routes several business-rule
      // exceptions (IllegalStateException, its own UnAutherisedException,
      // etc.) through the generic 500 handler rather than a 4xx one — see
      // advice/GlobalExceptionHandler.java. Those messages are safe,
      // human-authored strings (e.g. "Only confirmed bookings can be
      // cancelled."), not stack traces, so we surface them instead of a
      // generic message when present.
      return backendMessage || 'Something went wrong on our side. Please try again.';
    default:
      return backendMessage || 'Something went wrong on our side. Please try again.';
  }
}

export default axiosClient;
