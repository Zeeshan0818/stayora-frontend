import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, CalendarRange, Users, Search } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function SearchBar({ compact = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [city, setCity] = useState(params.get('city') || '');
  const [startDate, setStartDate] = useState(params.get('startDate') || '');
  const [endDate, setEndDate] = useState(params.get('endDate') || '');
  const [roomCount, setRoomCount] = useState(Number(params.get('roomCount')) || 1);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) return setError('Tell us where you want to stay.');
    if (!startDate || !endDate) return setError('Pick your check-in and check-out dates.');
    if (startDate >= endDate) return setError('Check-out should be after check-in.');
    setError('');

    const query = new URLSearchParams({
      city: city.trim(),
      startDate,
      endDate,
      roomCount: String(roomCount),
      page: '0',
    });
    navigate(`/hotels?${query.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full rounded-2xl border border-line bg-white/95 shadow-lift backdrop-blur ${
        compact ? 'p-3' : 'p-4 sm:p-5'
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]">
        <Field icon={<MapPin size={16} />} label="Destination">
          <input
            className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted placeholder:font-normal"
            placeholder="City — e.g. Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>

        <Field icon={<CalendarRange size={16} />} label="Check-in">
          <input
            type="date"
            min={todayISO()}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>

        <Field icon={<CalendarRange size={16} />} label="Check-out">
          <input
            type="date"
            min={startDate || todayISO()}
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>

        <Field icon={<Users size={16} />} label="Rooms">
          <select
            className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            value={roomCount}
            onChange={(e) => setRoomCount(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'room' : 'rooms'}
              </option>
            ))}
          </select>
        </Field>

        <button type="submit" className="btn-primary h-full !py-3.5 sm:!py-0">
          <Search size={17} />
          <span className="sm:hidden lg:inline">Search</span>
        </button>
      </div>
      {error && <p className="mt-2 px-1 text-sm text-red-600">{error}</p>}
    </form>
  );
}

function Field({ icon, label, children }) {
  return (
    <div className="rounded-xl border border-line/70 px-4 py-2.5 focus-within:border-pine-500 focus-within:ring-2 focus-within:ring-pine-100 transition-colors">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}
