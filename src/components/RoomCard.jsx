import { Users, BedDouble, ImageOff } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import DynamicPricingBadge from './DynamicPricingBadge';

export default function RoomCard({ room, selected, onSelect }) {
  const photo = room.photos?.[0];

  return (
    <div
      className={`card flex flex-col overflow-hidden sm:flex-row ${
        selected ? 'ring-2 ring-pine-500' : ''
      }`}
    >
      <div className="relative h-48 w-full flex-shrink-0 bg-ink/5 sm:h-auto sm:w-56">
        {photo ? (
          <img src={photo} alt={room.type} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ImageOff size={26} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h4 className="font-display text-lg text-ink">{room.type}</h4>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Users size={13} /> Sleeps {room.capacity ?? '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <BedDouble size={13} /> {room.totalCount ?? '—'} available
              </span>
            </div>
          </div>
          <DynamicPricingBadge />
        </div>

        {room.amenities?.length > 0 && (
          <p className="text-sm text-muted">{room.amenities.join(' · ')}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="font-display text-xl text-ink">
              {formatCurrency(room.basePrice)}
              <span className="ml-1 text-xs font-body font-normal text-muted">/ night</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(room)}
            className={selected ? 'btn-primary' : 'btn-outline'}
          >
            {selected ? 'Selected' : 'Select room'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="card flex overflow-hidden">
      <div className="skeleton h-auto w-56 rounded-none" />
      <div className="flex-1 space-y-3 p-5">
        <div className="skeleton h-5 w-1/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-8 w-1/4" />
      </div>
    </div>
  );
}
