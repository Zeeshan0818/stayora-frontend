import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ImageOff } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function HotelCard({ hotelPrice, searchQuery }) {
  const hotel = hotelPrice?.hotel;
  if (!hotel) return null;

  const photo = hotel.photos?.[0];
  const amenities = (hotel.amenities || []).slice(0, 3);
  const link = searchQuery ? `/hotels/${hotel.id}?${searchQuery}` : `/hotels/${hotel.id}`;

  return (
    <Link
      to={link}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/5">
        {photo ? (
          <img
            src={photo}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ImageOff size={28} />
          </div>
        )}
        {hotel.active === false && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-paper">
            Not yet live
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1 text-xs font-medium text-muted">
          <MapPin size={13} />
          {hotel.city}
        </div>
        <h3 className="font-display text-lg leading-snug text-ink">{hotel.name}</h3>

        {amenities.length > 0 && (
          <p className="text-xs text-muted">{amenities.join(' · ')}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">From</p>
            <p className="font-display text-xl text-ink">
              {formatCurrency(hotelPrice.price)}
              <span className="ml-1 text-xs font-body font-normal text-muted">/ night</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-pine-600 group-hover:gap-2 transition-all">
            View stay <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-6 w-1/3" />
      </div>
    </div>
  );
}
