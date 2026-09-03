import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import { adminApi } from '../../api/adminApi';
import { toFriendlyError } from '../../api/axiosClient';
import { PageSpinner, ErrorState } from '../../components/States';
import { useToast } from '../../context/ToastContext';

export default function AdminRoomEdit() {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    type: '',
    basePrice: '',
    photos: '',
    totalCount: '',
    capacity: '',
    amenities: '',
  });

  // Load existing room
  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        setError('');

        const room = await adminApi.getRoom(hotelId, roomId);

        setForm({
          type: room.type || '',
          basePrice: room.basePrice ?? '',
          photos: Array.isArray(room.photos)
            ? room.photos.join('\n')
            : '',
          totalCount: room.totalCount ?? '',
          capacity: room.capacity ?? '',
          amenities: Array.isArray(room.amenities)
            ? room.amenities.join(', ')
            : '',
        });
      } catch (err) {
        setError(toFriendlyError(err));
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [hotelId, roomId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save room
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const roomDto = {
        type: form.type,
        basePrice: Number(form.basePrice),
        photos: form.photos
          .split('\n')
          .map((photo) => photo.trim())
          .filter(Boolean),
        totalCount: Number(form.totalCount),
        capacity: Number(form.capacity),
        amenities: form.amenities
          .split(',')
          .map((amenity) => amenity.trim())
          .filter(Boolean),
      };

      await adminApi.updateRoom(hotelId, roomId, roomDto);

      toast.success('Room updated successfully.');

      navigate(`/admin/hotels/${hotelId}`);
    } catch (err) {
      toast.error(toFriendlyError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSpinner />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/admin/hotels/${hotelId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to hotel
        </Link>

        <h1 className="text-2xl">Edit Room</h1>

        <p className="mt-1 text-sm text-muted">
          Update the room details below.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-5 p-6">

        {/* Room Type */}
        <div>
          <label className="label">
            Room type
          </label>

          <input
            type="text"
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="King Bed with Private Pool"
            className="input"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="label">
            Price per night
          </label>

          <input
            type="number"
            name="basePrice"
            value={form.basePrice}
            onChange={handleChange}
            placeholder="5000"
            min="0"
            className="input"
            required
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="label">
            Capacity
          </label>

          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            placeholder="3"
            min="1"
            className="input"
            required
          />
        </div>

        {/* Total Rooms */}
        <div>
          <label className="label">
            Total rooms
          </label>

          <input
            type="number"
            name="totalCount"
            value={form.totalCount}
            onChange={handleChange}
            placeholder="20"
            min="1"
            className="input"
            required
          />
        </div>

        {/* Photos */}
        <div>
          <label className="label">
            Photos
          </label>

          <textarea
            name="photos"
            value={form.photos}
            onChange={handleChange}
            placeholder={`https://example.com/room1.jpg
https://example.com/room2.jpg`}
            rows="4"
            className="input"
          />

          <p className="mt-1 text-xs text-muted">
            Enter one image URL per line.
          </p>
        </div>

        {/* Amenities */}
        <div>
          <label className="label">
            Amenities
          </label>

          <input
            type="text"
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="Free Wi-Fi, Air Conditioning, TV"
            className="input"
          />

          <p className="mt-1 text-xs text-muted">
            Separate amenities using commas.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            <Save size={16} />

            {saving ? 'Saving...' : 'Save changes'}
          </button>

          <Link
            to={`/admin/hotels/${hotelId}`}
            className="btn-outline"
          >
            Cancel
          </Link>

        </div>
      </form>
    </div>
  );
}