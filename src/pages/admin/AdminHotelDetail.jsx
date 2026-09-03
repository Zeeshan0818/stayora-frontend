import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, Trash2, MapPin, Pencil } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { toFriendlyError } from '../../api/axiosClient';
import { PageSpinner, ErrorState, EmptyState } from '../../components/States';
import { formatCurrency } from '../../utils/format';
import { useToast } from '../../context/ToastContext';

export default function AdminHotelDetail() {
  const { hotelId } = useParams();
  const toast = useToast();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');

    Promise.all([
      adminApi.getHotel(hotelId),
      adminApi.getRooms(hotelId)
    ])
      .then(([h, r]) => {
        setHotel(h);
        setRooms(r);
      })
      .catch((err) => setError(toFriendlyError(err)));
  };

  useEffect(load, [hotelId]);

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room type?')) return;

    try {
      await adminApi.deleteRoom(hotelId, roomId);
      toast.success('Room deleted.');
      load();
    } catch (err) {
      toast.error(toFriendlyError(err));
    }
  };

  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  if (!hotel || rooms === null) {
    return <PageSpinner />;
  }

  return (
    <div>
      {/* Hotel Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">{hotel.name}</h1>

          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin size={14} />
            {hotel.city}
          </p>
        </div>

        <Link
          to={`/admin/hotels/${hotelId}/edit`}
          className="btn-outline"
        >
          Edit hotel
        </Link>
      </div>

      {/* Rooms Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">
          Rooms
        </h2>

        <Link
          to={`/admin/hotels/${hotelId}/rooms/new`}
          className="btn-primary"
        >
          <Plus size={16} />
          Add room
        </Link>
      </div>

      {/* Rooms */}
      {rooms.length === 0 ? (
        <EmptyState
          title="No room types yet"
          description="Add a room to start accepting bookings."
        />
      ) : (
        <div className="space-y-3">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="card flex items-center justify-between p-4"
            >
              {/* Room Information */}
              <div>
                <p className="font-medium text-ink">
                  {r.type}
                </p>

                <p className="text-sm text-muted">
                  {formatCurrency(r.basePrice)} / night · Sleeps{' '}
                  {r.capacity} · {r.totalCount} rooms
                </p>
              </div>

              {/* Room Actions */}
              <div className="flex items-center gap-4">

                {/* Edit Room */}
                <Link
                  to={`/admin/hotels/${hotelId}/rooms/${r.id}/edit`}
                  className="text-muted hover:text-ink"
                  aria-label={`Edit ${r.type}`}
                >
                  <Pencil size={17} />
                </Link>

                {/* Delete Room */}
                <button
                  onClick={() => handleDeleteRoom(r.id)}
                  className="text-muted hover:text-red-600"
                  aria-label={`Delete ${r.type}`}
                >
                  <Trash2 size={17} />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}