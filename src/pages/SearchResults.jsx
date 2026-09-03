import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import HotelCard, { HotelCardSkeleton } from '../components/HotelCard';
import Pagination from '../components/Pagination';
import { ErrorState, EmptyState } from '../components/States';
import { hotelApi } from '../api/hotelApi';
import { toFriendlyError } from '../api/axiosClient';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const city = params.get('city') || '';
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';
  const roomCount = Number(params.get('roomCount')) || 1;
  const page = Number(params.get('page')) || 0;

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const hasCriteria = Boolean(city && startDate && endDate);

  useEffect(() => {
    if (!hasCriteria) {
      setLoading(false);
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');

    hotelApi
      .search({ city, startDate, endDate, roomCount, page, size: 9 })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(toFriendlyError(err)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, startDate, endDate, roomCount, page]);

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchQuery = params.toString();

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <SearchBar compact />
      </div>

      {hasCriteria && (
        <div className="mb-6">
          <h1 className="text-2xl">Stays in {city}</h1>
          <p className="text-sm text-muted">
            {formatRange(startDate, endDate)} · {roomCount} {roomCount === 1 ? 'room' : 'rooms'}
          </p>
        </div>
      )}

      {!hasCriteria ? (
        <EmptyState
          title="Tell us where and when"
          description="Fill in a destination and your dates above to see available stays."
        />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <HotelCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setParams(new URLSearchParams(params))} />
      ) : result?.content?.length ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.content.map((hp) => (
              <HotelCard key={hp.hotel.id} hotelPrice={hp} searchQuery={searchQuery} />
            ))}
          </div>
          <Pagination page={result.number} totalPages={result.totalPages} onPageChange={goToPage} />
        </>
      ) : (
        <EmptyState
          title={`No stays found in ${city}`}
          description="Try different dates, a different room count, or another city."
        />
      )}
    </div>
  );
}

function formatRange(start, end) {
  const opts = { day: 'numeric', month: 'short' };
  try {
    const s = new Date(start).toLocaleDateString('en-IN', opts);
    const e = new Date(end).toLocaleDateString('en-IN', opts);
    return `${s} – ${e}`;
  } catch {
    return `${start} – ${end}`;
  }
}
