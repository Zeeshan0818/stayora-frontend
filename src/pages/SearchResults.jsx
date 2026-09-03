import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { hotelApi } from '../api/hotelApi';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const city = params.get('city') || '';
  const startDate = params.get('startDate') || '';
  const endDate = params.get('endDate') || '';
  const roomCount = Number(params.get('roomCount')) || 1;
  const page = Number(params.get('page')) || 0;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If city + dates are present,
  // perform an availability search.
  //
  // If dates are not present,
  // simply browse hotels.
  const hasAvailabilitySearch = Boolean(
    city && startDate && endDate
  );

  const searchQuery = useMemo(
    () => Object.fromEntries(params.entries()),
    [params]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadHotels() {
      try {
        setLoading(true);
        setError('');

        let data;

        if (hasAvailabilitySearch) {
          // Search with dates and room count
          data = await hotelApi.search({
            city,
            startDate,
            endDate,
            roomCount,
            page,
            size: 9,
          });
        } else {
          // Browse hotels without dates
          data = await hotelApi.browse({
            city,
            page,
            size: 9,
          });
        }

        if (!cancelled) {
          setResult(data);
        }
      } catch (err) {
        console.error('Failed to load hotels:', err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Unable to load hotels right now.'
          );

          setResult(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHotels();

    return () => {
      cancelled = true;
    };
  }, [
    city,
    startDate,
    endDate,
    roomCount,
    page,
    hasAvailabilitySearch,
  ]);

  const hotels = result?.content || [];

  const goToPage = (newPage) => {
    const nextParams = new URLSearchParams(params);

    nextParams.set('page', newPage);

    navigate(`/hotels?${nextParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Search bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <SearchBar compact />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="mb-8">

          {city ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                Stays in {city}
              </h1>

              {hasAvailabilitySearch ? (
                <p className="text-gray-600 mt-2">
                  {startDate} → {endDate} · {roomCount}{' '}
                  {roomCount === 1 ? 'room' : 'rooms'}
                </p>
              ) : (
                <p className="text-gray-600 mt-2">
                  Explore places to stay in {city}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                All stays
              </h1>

              <p className="text-gray-600 mt-2">
                Explore places to stay
              </p>
            </>
          )}

        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-56 bg-gray-200" />

                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Something went wrong
            </h2>

            <p className="text-gray-600 mt-2">
              {error}
            </p>
          </div>
        )}

        {/* No results */}
        {!loading &&
          !error &&
          result &&
          hotels.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                {city
                  ? `No stays found in ${city}`
                  : 'No stays found'}
              </h2>

              <p className="text-gray-600 mt-2">
                {hasAvailabilitySearch
                  ? 'Try different dates or another city.'
                  : 'There are no properties available to browse yet.'}
              </p>

            </div>
          )}

        {/* Hotel results */}
        {!loading &&
          !error &&
          hotels.length > 0 && (

            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {hotels.map((hotel) => {

                  // Availability search returns HotelPriceDto
                  if (hasAvailabilitySearch) {
                    return (
                      <HotelCard
                        key={hotel.hotel.id}
                        hotelPrice={hotel}
                        searchQuery={searchQuery}
                      />
                    );
                  }

                  // Normal browsing returns HotelDto
                  return (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      searchQuery={searchQuery}
                    />
                  );
                })}

              </div>

              {/* Pagination */}
              {result.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">

                  <button
                    disabled={result.first}
                    onClick={() => goToPage(page - 1)}
                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {result.number + 1} of {result.totalPages}
                  </span>

                  <button
                    disabled={result.last}
                    onClick={() => goToPage(page + 1)}
                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>

                </div>
              )}

            </>
          )}

      </main>
    </div>
  );
}