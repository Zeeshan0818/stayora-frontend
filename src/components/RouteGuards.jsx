import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSpinner } from './States';

export function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Note: this only hides the dashboard in the UI. The backend's own
// authorization rule for these endpoints has a path typo
// ("/admins/**" instead of "/admin/**" in WebSecurityFilter.java), so it
// currently does not actually restrict /admin/hotels/** by role — see the
// README for details. Real enforcement must happen server-side.
export function RequireHost({ children }) {
  const { isAuthenticated, isHotelManager, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isHotelManager) {
    return <Navigate to="/" replace />;
  }
  return children;
}
