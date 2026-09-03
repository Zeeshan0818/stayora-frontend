import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle2, XCircle, ImageOff } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getMyHotelIds, forgetHotelId } from '../../utils/adminStore';
import { PageSpinner, EmptyState } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import { toFriendlyError } from '../../api/axiosClient';

export default function AdminHotels() {
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    const ids = getMyHotelIds();
    Promise.allSettled(ids.map((id) => adminApi.getHotel(id))).then((results) => {
      const loaded = [];
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') loaded.push(r.value);
        else forgetHotelId(ids[i]); // hotel was deleted elsewhere — drop the stale id
      });
      setHotels(loaded);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleActivate = async (id) => {
    try {
      await adminApi.activateHotel(id);
      toast.success('Hotel activated.');
      load();
    } catch (err) {
      toast.error(toFriendlyError(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel? This cannot be undone.')) return;
    try {
      await adminApi.deleteHotel(id);
      forgetHotelId(id);
      toast.success('Hotel deleted.');
      load();
    } catch (err) {
      toast.error(toFriendlyError(err));
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl">Your hotels</h1>
        <Link to="/admin/hotels/new" className="btn-primary">
          <Plus size={16} />
          New hotel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <EmptyState
          title="No hotels yet"
          description="List your first property to start accepting bookings."
          actionLabel="List a hotel"
          actionTo="/admin/hotels/new"
        />
      ) : (
        <div className="space-y-3">
          {hotels.map((h) => (
            <div key={h.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-ink/5">
                {h.photos?.[0] ? (
                  <img src={h.photos[0]} alt={h.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <ImageOff size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base text-ink">{h.name}</p>
                  {h.active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pine-50 px-2 py-0.5 text-[11px] font-semibold text-pine-700">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-muted">
                      <XCircle size={11} /> Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">{h.city}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/admin/hotels/${h.id}`} className="btn-ghost !px-3 !py-2">
                  View
                </Link>
                <Link to={`/admin/hotels/${h.id}/edit`} className="btn-outline !px-3 !py-2">
                  Edit
                </Link>
                {!h.active && (
                  <button onClick={() => handleActivate(h.id)} className="btn-outline !px-3 !py-2">
                    Activate
                  </button>
                )}
                <button onClick={() => handleDelete(h.id)} className="btn-danger !px-3 !py-2">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
