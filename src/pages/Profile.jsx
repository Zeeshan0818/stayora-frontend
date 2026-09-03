import { Info, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCachedName } from '../utils/profileCache';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const cachedName = getCachedName(user?.email);

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out.");
    navigate('/', { replace: true });
  };

  return (
    <div className="container-page max-w-lg py-12">
      <h1 className="text-3xl">Profile</h1>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pine-50 text-pine-600">
            <User size={24} />
          </div>
          <div>
            <p className="font-display text-lg text-ink">{cachedName || 'Stayora guest'}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        {!cachedName && (
          <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-gold-light/30 px-3 py-2.5 text-xs text-gold-dark">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            We don't have your name cached on this device (the backend has no endpoint to fetch a
            saved profile). It's remembered automatically after you sign up in this browser.
          </p>
        )}

        <button onClick={handleLogout} className="btn-outline mt-6 w-full">
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
}
