import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { toFriendlyError } from '../../api/axiosClient';
import { rememberHotelId } from '../../utils/adminStore';
import { useToast } from '../../context/ToastContext';
import { PageSpinner } from '../../components/States';

const emptyForm = {
  name: '',
  city: '',
  photos: '',
  amenities: '',
  address: '',
  phoneNumber: '',
  email: '',
  location: '',
};

export default function AdminHotelForm() {
  const { hotelId } = useParams();
  const isEdit = Boolean(hotelId);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    adminApi
      .getHotel(hotelId)
      .then((h) =>
        setForm({
          name: h.name || '',
          city: h.city || '',
          photos: (h.photos || []).join(', '),
          amenities: (h.amenities || []).join(', '),
          address: h.hotelContactinfo?.address || '',
          phoneNumber: h.hotelContactinfo?.phoneNumber || '',
          email: h.hotelContactinfo?.email || '',
          location: h.hotelContactinfo?.location || '',
        })
      )
      .catch((err) => setError(toFriendlyError(err)))
      .finally(() => setLoading(false));
  }, [hotelId, isEdit]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.city.trim()) {
      setError('Hotel name and city are required.');
      return;
    }
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      photos: splitList(form.photos),
      amenities: splitList(form.amenities),
      hotelContactinfo: {
        address: form.address.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
      },
    };

    try {
      if (isEdit) {
        await adminApi.updateHotel(hotelId, payload);
        toast.success('Hotel updated.');
        navigate(`/admin/hotels/${hotelId}`);
      } else {
        const created = await adminApi.createHotel(payload);
        rememberHotelId(created.id);
        toast.success('Hotel created — activate it once it looks right.');
        navigate(`/admin/hotels/${created.id}`);
      }
    } catch (err) {
      setError(toFriendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl">{isEdit ? 'Edit hotel' : 'List a new hotel'}</h1>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Hotel name</label>
            <input className="input" value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={update('city')} />
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

        <div className="border-t border-line pt-4">
          <p className="label !mb-3">Contact information</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input className="input" placeholder="Address" value={form.address} onChange={update('address')} />
            <input className="input" placeholder="Phone number" value={form.phoneNumber} onChange={update('phoneNumber')} />
            <input className="input" placeholder="Contact email" value={form.email} onChange={update('email')} />
            <input className="input" placeholder="Map location / link" value={form.location} onChange={update('location')} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create hotel'}
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
