import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { toFriendlyError } from '../../api/axiosClient';
import { useToast } from '../../context/ToastContext';

const emptyForm = { type: '', basePrice: '', capacity: '', totalCount: '', photos: '', amenities: '' };

export default function AdminRoomForm() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.type.trim() || !form.basePrice || !form.capacity || !form.totalCount) {
      setError('Fill in room type, price, capacity and count.');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createRoom(hotelId, {
        type: form.type.trim(),
        basePrice: Number(form.basePrice),
        capacity: Number(form.capacity),
        totalCount: Number(form.totalCount),
        photos: splitList(form.photos),
        amenities: splitList(form.amenities),
      });
      toast.success('Room added.');
      navigate(`/admin/hotels/${hotelId}`);
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl">Add a room</h1>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label">Room type</label>
          <input className="input" value={form.type} onChange={update('type')} placeholder="Deluxe King Room" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Base price / night</label>
            <input type="number" min="0" className="input" value={form.basePrice} onChange={update('basePrice')} />
          </div>
          <div>
            <label className="label">Capacity</label>
            <input type="number" min="1" className="input" value={form.capacity} onChange={update('capacity')} />
          </div>
          <div>
            <label className="label">Total rooms</label>
            <input type="number" min="1" className="input" value={form.totalCount} onChange={update('totalCount')} />
          </div>
        </div>
        <div>
          <label className="label">Photo URLs (comma-separated)</label>
          <textarea className="input" rows={2} value={form.photos} onChange={update('photos')} />
        </div>
        <div>
          <label className="label">Amenities (comma-separated)</label>
          <textarea className="input" rows={2} value={form.amenities} onChange={update('amenities')} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? 'Saving…' : 'Add room'}
        </button>
      </form>
    </div>
  );
}

function splitList(value) {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}
