import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, BedDouble, CheckCircle2, Info } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getMyHotelIds } from '../../utils/adminStore';
import { PageSpinner } from '../../components/States';

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [roomCounts, setRoomCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    const ids = getMyHotelIds();

    (async () => {
      const results = await Promise.allSettled(ids.map((id) => adminApi.getHotel(id)));
      const loaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
      if (cancelled) return;
      setHotels(loaded);

      const counts = {};
      await Promise.all(
        loaded.map(async (h) => {
          try {
            const rooms = await adminApi.getRooms(h.id);
            counts[h.id] = rooms.length;
          } catch {
            counts[h.id] = 0;
          }
        })
      );
      if (!cancelled) {
        setRoomCounts(counts);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageSpinner />;

  const totalRooms = Object.values(roomCounts).reduce((a, b) => a + b, 0);
  const activeCount = hotels.filter((h) => h.active).length;

  return (
    <div>
      <h1 className="text-2xl">Host overview</h1>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        Hotels you've created in this browser (the backend has no "list my hotels" endpoint, so we
        track ids locally and refresh each one from the real API — see README).
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Building2 size={18} />} label="Hotels" value={hotels.length} />
        <StatCard icon={<BedDouble size={18} />} label="Rooms" value={totalRooms} />
        <StatCard icon={<CheckCircle2 size={18} />} label="Active properties" value={activeCount} />
        <StatCard icon={<Info size={18} />} label="Bookings" value="—" note="No backend endpoint yet" />
      </div>

      <div className="mt-8">
        <Link to="/admin/hotels/new" className="btn-primary">
          List a new hotel
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, note }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      {note && <p className="mt-0.5 text-[11px] text-muted">{note}</p>}
    </div>
  );
}
