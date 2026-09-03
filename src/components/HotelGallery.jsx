import { useState } from 'react';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HotelGallery({ photos = [], alt }) {
  const [index, setIndex] = useState(0);

  if (!photos.length) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl2 bg-ink/5 text-muted">
        <ImageOff size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: swipeable single image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl2 sm:hidden">
        <img src={photos[index]} alt={alt} className="h-full w-full object-cover" />
        {photos.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next photo"
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Desktop: large primary + supporting grid */}
      <div className="hidden gap-2 sm:grid sm:grid-cols-4 sm:grid-rows-2 sm:gap-3" style={{ height: 420 }}>
        <div className="col-span-2 row-span-2 overflow-hidden rounded-xl2">
          <img src={photos[0]} alt={alt} className="h-full w-full object-cover" />
        </div>
        {photos.slice(1, 5).map((p, i) => (
          <div key={i} className="overflow-hidden rounded-xl2">
            <img src={p} alt={`${alt} photo ${i + 2}`} className="h-full w-full object-cover" />
          </div>
        ))}
        {Array.from({ length: Math.max(0, 4 - (photos.length - 1)) }).map((_, i) => (
          <div key={`ph-${i}`} className="rounded-xl2 bg-ink/5" />
        ))}
      </div>
    </div>
  );
}
