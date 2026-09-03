import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, ShieldAlert } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="container-page py-8">
      <div className="mb-6 flex items-center gap-2 rounded-lg bg-gold-light/25 px-4 py-2.5 text-xs text-gold-dark">
        <ShieldAlert size={14} className="flex-shrink-0" />
        This dashboard is hidden in the UI based on your account's role, but the backend's own
        role check for these endpoints currently has a routing typo (see README) — don't treat
        this page as the security boundary.
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          <SideLink to="/admin" icon={<LayoutDashboard size={17} />} end>
            Overview
          </SideLink>
          <SideLink to="/admin/hotels" icon={<Building2 size={17} />}>
            Hotels
          </SideLink>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${
          isActive ? 'bg-ink text-paper' : 'text-charcoal hover:bg-ink/5'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
