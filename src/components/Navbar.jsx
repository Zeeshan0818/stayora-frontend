import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  Briefcase,
  Compass,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium transition-colors hover:text-ink ${
          isActive ? 'text-ink' : 'text-muted'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobile drawer
  const [menuOpen, setMenuOpen] = useState(false); // desktop account menu
  const { isAuthenticated, isHotelManager, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close the desktop account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    // AuthContext.logout() clears the access token, the authenticated user
    // state, and detaches this browser's local trips/host caches from the
    // now-logged-out account (see AuthContext + sessionScope.js). It does
    // NOT — and cannot — revoke the RefreshToken cookie server-side, since
    // the backend has no /auth/logout endpoint (see README).
    logout();
    setOpen(false);
    setMenuOpen(false);
    toast.success("You've been logged out.");
    // `replace` so the back button doesn't land back on an authenticated
    // page's history entry — though RequireAuth would still redirect it
    // away immediately either way, since it re-checks isAuthenticated on
    // every render rather than trusting stale state.
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <NavItem to="/hotels">Explore</NavItem>
          {isAuthenticated && <NavItem to="/trips">Trips</NavItem>}
          {isHotelManager && <NavItem to="/admin">Host dashboard</NavItem>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-line/70 py-1.5 pl-1.5 pr-3 text-sm font-medium text-ink transition-colors hover:border-ink/30"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-50 text-pine-600">
                  <User size={15} />
                </span>
                Account
                <ChevronDown size={15} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-lift"
                >
                  <MenuLink to="/profile" icon={<User size={16} />} onClick={() => setMenuOpen(false)}>
                    Profile
                  </MenuLink>
                  <MenuLink to="/trips" icon={<Briefcase size={16} />} onClick={() => setMenuOpen(false)}>
                    My Trips
                  </MenuLink>
                  {isHotelManager && (
                    <MenuLink
                      to="/admin"
                      icon={<LayoutDashboard size={16} />}
                      onClick={() => setMenuOpen(false)}
                    >
                      Host Dashboard
                    </MenuLink>
                  )}
                  <div className="my-1.5 border-t border-line" />
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="p-2 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line/70 bg-paper md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <MobileLink to="/hotels" icon={<Compass size={18} />} onClick={() => setOpen(false)}>
              Explore
            </MobileLink>
            {isAuthenticated && (
              <>
                <MobileLink to="/profile" icon={<User size={18} />} onClick={() => setOpen(false)}>
                  Profile
                </MobileLink>
                <MobileLink to="/trips" icon={<Briefcase size={18} />} onClick={() => setOpen(false)}>
                  My Trips
                </MobileLink>
                {isHotelManager && (
                  <MobileLink to="/admin" icon={<LayoutDashboard size={18} />} onClick={() => setOpen(false)}>
                    Host Dashboard
                  </MobileLink>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="mt-2 flex gap-3 px-3">
                <Link to="/login" className="btn-outline flex-1" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, icon, children, onClick }) {
  return (
    <NavLink
      role="menuitem"
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium ${
          isActive ? 'bg-ink/5 text-ink' : 'text-charcoal hover:bg-ink/5'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function MobileLink({ to, icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
          isActive ? 'bg-ink/5 text-ink' : 'text-muted'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
