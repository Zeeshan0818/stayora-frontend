import { Plus, Trash2 } from 'lucide-react';
import { GENDERS } from '../utils/status';

export default function GuestForm({ guests, onChange, minGuests = 1 }) {
  const updateGuest = (index, field, value) => {
    const next = guests.map((g, i) => (i === index ? { ...g, [field]: value } : g));
    onChange(next);
  };

  const addGuest = () => onChange([...guests, { name: '', gender: 'MALE', age: '' }]);
  const removeGuest = (index) => onChange(guests.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {guests.map((guest, i) => (
        <div key={i} className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Guest {i + 1}</p>
            {guests.length > minGuests && (
              <button
                type="button"
                onClick={() => removeGuest(i)}
                className="text-muted hover:text-red-600"
                aria-label={`Remove guest ${i + 1}`}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Full name</label>
              <input
                className="input"
                value={guest.name}
                onChange={(e) => updateGuest(i, 'name', e.target.value)}
                placeholder="Guest name"
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={guest.gender}
                onChange={(e) => updateGuest(i, 'gender', e.target.value)}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                className="input"
                value={guest.age}
                onChange={(e) => updateGuest(i, 'age', e.target.value)}
                placeholder="Age"
              />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addGuest} className="btn-outline w-full sm:w-auto">
        <Plus size={16} />
        Add another guest
      </button>
    </div>
  );
}

export function validateGuests(guests) {
  const errors = [];
  guests.forEach((g, i) => {
    if (!g.name?.trim()) errors.push(`Guest ${i + 1}: name is required.`);
    const age = Number(g.age);
    if (!g.age || Number.isNaN(age) || age <= 0 || age > 120) {
      errors.push(`Guest ${i + 1}: enter a valid age.`);
    }
  });
  return errors;
}
