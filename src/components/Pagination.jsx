import { ChevronLeft, ChevronRight } from 'lucide-react';

// Expects Spring's Page shape: { number, totalPages }
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="Pagination">
      <button
        className="btn-ghost !px-3 !py-2"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
              p === page ? 'bg-ink text-paper' : 'text-charcoal hover:bg-ink/5'
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        className="btn-ghost !px-3 !py-2"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

function buildPageList(current, total) {
  const delta = 1;
  const range = [];
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  const withDots = [];
  let prev;
  for (const p of range) {
    if (prev !== undefined && p - prev > 1) withDots.push('…');
    withDots.push(p);
    prev = p;
  }
  return withDots;
}
