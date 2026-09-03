import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, CalendarRange, Users } from 'lucide-react';
import HotelGallery from '../components/HotelGallery';
import RoomCard, { RoomCardSkeleton } from '../components/RoomCard';
import { ErrorState } from '../components/States';
import { hotelApi } from '../api/hotelApi';
import { toFriendlyError } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function HotelDetails() {
  const { hotelId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // CHANGED:
  // Get "initializing" from AuthContext so we wait for the
  // authentication/session restoration before calling the backend.
  const { isAuthenticated, initializing } = useAuth();

  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [startDate, setStartDate] = useState(params.get('startDate') || '');
  const [endDate, setEndDate] = useState(params.get('endDate') || '');
  const [roomCount, setRoomCount] = useState(
    Number(params.get('roomCount')) || 1
  );
  const [dateError, setDateError] = useState('');

  useEffect(() => {

    // IMPORTANT:
    // Don't request hotel information until AuthContext
    // has finished restoring the user's login session.
    if (initializing) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError('');

    hotelApi
      .getInfo(hotelId)
      .then((data) => {
        if (!cancelled) {
          setInfo(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toFriendlyError(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };

  }, [hotelId, initializing]);

  // Wait for authentication initialization OR hotel information.
  if (initializing || loading) {
    return <HotelDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!info) {
    return null;
  }

  const { hotel, room: rooms = [] } = info;
  const contact = hotel.hotelContactinfo;

  const handleReserve = () => {
    setDateError('');

    if (!startDate || !endDate) {
      return setDateError(
        'Choose your check-in and check-out dates.'
      );
    }

    if (startDate >= endDate) {
      return setDateError(
        'Check-out should be after check-in.'
      );
    }

    if (!selectedRoom) {
      return setDateError(
        'Select a room to continue.'
      );
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: {
            pathname:
              window.location.pathname +
              window.location.search,
          },
        },
      });

      return;
    }

    const query = new URLSearchParams({
      hotelId: String(hotel.id),
      roomId: String(selectedRoom.id),
      city: hotel.city,
      checkInDate: startDate,
      checkOutDate: endDate,
      roomCount: String(roomCount),
    });

    navigate(`/booking/start?${query.toString()}`, {
      state: {
        hotelName: hotel.name,
        roomType: selectedRoom.type,
      },
    });
  };

  return (
    <div className="container-page py-8">

      <HotelGallery
        photos={hotel.photos || []}
        alt={hotel.name}
      />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">

        <div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <MapPin size={15} />
            {hotel.city}
          </div>

          {/* Hotel name */}
          <h1 className="mt-1 text-3xl">
            {hotel.name}
          </h1>

          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-charcoal"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Contact information */}
          {contact &&
            (contact.address ||
              contact.phoneNumber ||
              contact.email) && (
              <div className="mt-6 space-y-1.5 border-t border-line pt-5 text-sm text-charcoal">

                {contact.address && (
                  <p className="flex items-center gap-2 text-muted">
                    <MapPin size={14} />
                    {contact.address}
                  </p>
                )}

                {contact.phoneNumber && (
                  <p className="flex items-center gap-2 text-muted">
                    <Phone size={14} />
                    {contact.phoneNumber}
                  </p>
                )}

                {contact.email && (
                  <p className="flex items-center gap-2 text-muted">
                    <Mail size={14} />
                    {contact.email}
                  </p>
                )}

              </div>
            )}

          {/* Available rooms */}
          <div className="mt-10 border-t border-line pt-8">

            <h2 className="text-2xl">
              Available rooms
            </h2>

            {rooms.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No rooms have been listed for this stay yet.
              </p>
            ) : (
              <div className="mt-5 space-y-4">

                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    selected={selectedRoom?.id === room.id}
                    onSelect={setSelectedRoom}
                  />
                ))}

              </div>
            )}

          </div>

        </div>

        {/* Booking summary panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">

          <div className="card space-y-4 p-5">

            <h3 className="font-display text-lg text-ink">
              Reserve your stay
            </h3>

            {/* Check-in */}
            <div>
              <label className="label">
                Check-in
              </label>

              <input
                type="date"
                min={todayISO()}
                className="input"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>

            {/* Check-out */}
            <div>
              <label className="label">
                Check-out
              </label>

              <input
                type="date"
                min={startDate || todayISO()}
                className="input"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />
            </div>

            {/* Room count */}
            <div>
              <label className="label">
                Rooms
              </label>

              <select
                className="input"
                value={roomCount}
                onChange={(e) =>
                  setRoomCount(Number(e.target.value))
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'room' : 'rooms'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected room */}
            <div className="rounded-lg bg-pine-50/70 px-3 py-2.5 text-xs text-pine-700">

              {selectedRoom ? (
                <>
                  Selected:{' '}
                  <span className="font-semibold">
                    {selectedRoom.type}
                  </span>
                </>
              ) : (
                'Select a room below to continue.'
              )}

            </div>

            {/* Date/room error */}
            {dateError && (
              <p className="text-sm text-red-600">
                {dateError}
              </p>
            )}

            {/* Reserve button */}
            <button
              onClick={handleReserve}
              className="btn-primary w-full"
            >
              <CalendarRange size={16} />
              Reserve
            </button>

            {/* Login message */}
            {!isAuthenticated && (
              <p className="text-center text-xs text-muted">
                <Users
                  size={12}
                  className="mr-1 inline"
                />
                You'll be asked to log in before confirming.
              </p>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}

function HotelDetailsSkeleton() {
  return (
    <div className="container-page py-8">

      <div className="skeleton aspect-[16/9] w-full sm:h-[420px]" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">

        <div className="space-y-4">

          <div className="skeleton h-4 w-24" />

          <div className="skeleton h-8 w-2/3" />

          <div className="skeleton h-4 w-1/2" />

          <div className="mt-8 space-y-4">

            <RoomCardSkeleton />

            <RoomCardSkeleton />

          </div>

        </div>

        <div className="skeleton h-96 w-full" />

      </div>

    </div>
  );
}