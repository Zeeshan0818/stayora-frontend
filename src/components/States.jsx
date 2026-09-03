import { AlertTriangle, Compass, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-line bg-white px-6 py-14 text-center">
      <AlertTriangle className="text-gold-dark" size={28} />
      <p className="font-display text-lg text-ink">{message}</p>
      <p className="text-sm text-muted">Please try again.</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-2">
          <RefreshCcw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, actionTo, icon }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-line bg-white/60 px-6 py-16 text-center">
      {icon || <Compass className="text-gold-dark" size={28} />}
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-2">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink/15 border-t-gold" />
    </div>
  );
}
