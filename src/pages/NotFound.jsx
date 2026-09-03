import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <Compass className="text-gold-dark" size={32} />
      <h1 className="text-3xl">Page not found</h1>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back home
      </Link>
    </div>
  );
}
