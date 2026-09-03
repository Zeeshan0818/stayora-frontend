import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CalendarClock, BadgePercent, Undo2, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HotelCard, { HotelCardSkeleton } from '../components/HotelCard';
import { EmptyState } from '../components/States';
import { hotelApi } from '../api/hotelApi';

const FEATURED_CITIES = ['Mumbai', 'Goa', 'Jaipur', 'Bengaluru', 'Udaipur', 'Manali'];

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [featuredCity, setFeaturedCity] = useState('Mumbai');

  useEffect(() => {
    let cancelled = false;
    setFeatured(null);
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);

    hotelApi
      .search({
        city: featuredCity,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        roomCount: 1,
        page: 0,
        size: 6,
      })
      .then((data) => !cancelled && setFeatured(data))
      .catch(() => !cancelled && setFeatured({ content: [], empty: true }));

    return () => {
      cancelled = true;
    };
  }, [featuredCity]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1800&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container-page relative flex flex-col items-start gap-8 py-20 sm:py-28">
          <p className="eyebrow">Stayora — beautiful places to stay</p>
          <h1 className="max-w-2xl font-display text-4xl leading-tight text-paper sm:text-6xl">
            Find your next stay.
          </h1>
          <p className="horizon-rule" />
          <p className="max-w-lg text-base text-paper/70 sm:text-lg">
            Discover beautiful places, flexible stays and unforgettable experiences.
          </p>
        </div>
        <div className="container-page relative -mt-6 pb-16 sm:-mt-10">
          <SearchBar />
        </div>
      </section>

      {/* Featured stays */}
      <section className="container-page py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Handpicked</p>
            <h2 className="mt-1 text-3xl">Featured stays</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FEATURED_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setFeaturedCity(city)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  featuredCity === city
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-charcoal hover:border-ink/40'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {featured === null ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.content?.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.content.map((hp) => (
              <HotelCard key={hp.hotel.id} hotelPrice={hp} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No live stays in ${featuredCity} yet`}
            description="Try another city, or check back once more properties go live."
          />
        )}

        <div className="mt-10 text-center">
          <Link to="/hotels" className="btn-outline">
            Browse all stays <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="bg-pine-50/60 py-16">
        <div className="container-page">
          <p className="eyebrow">Where to next</p>
          <h2 className="mt-1 text-3xl">Popular destinations</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {FEATURED_CITIES.map((city, i) => (
              <Link
                key={city}
                to={`/hotels?city=${encodeURIComponent(city)}`}
                className="group relative aspect-square overflow-hidden rounded-xl2"
              >
                <img
                  src={`https://source.unsplash.com/collection/1163637/300x300?sig=${i}`}
                  alt={city}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => (e.currentTarget.style.opacity = 0)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0" />
                <span className="absolute bottom-3 left-3 font-display text-base text-paper">
                  {city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stayora */}
      <section className="container-page py-16">
        <p className="eyebrow">Why Stayora</p>
        <h2 className="mt-1 text-3xl">Booking, done properly.</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <ValueProp
            icon={<ShieldCheck size={22} />}
            title="Secure booking"
            body="Every payment is verified server-side before a stay is ever confirmed."
          />
          <ValueProp
            icon={<CalendarClock size={22} />}
            title="Flexible stays"
            body="Search real availability across your exact dates and room count."
          />
          <ValueProp
            icon={<BadgePercent size={22} />}
            title="Transparent pricing"
            body="Prices reflect live availability and demand — no hidden markups."
          />
          <ValueProp
            icon={<Undo2 size={22} />}
            title="Easy cancellation"
            body="Cancel a reservation in a couple of taps, right from your trips."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-16">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="text-3xl text-paper sm:text-4xl">Ready for your next getaway?</h2>
          <Link to="/hotels" className="btn-gold">
            Start exploring <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ValueProp({ icon, title, body }) {
  return (
    <div>
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-pine-50 text-pine-600">
        {icon}
      </div>
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
