import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <CompassIcon className="text-brand-300 mb-4" size={56} />
    <h1 className="font-display font-bold text-3xl text-ink-900">404 — Page not found</h1>
    <p className="text-slate-500 mt-2 max-w-sm">The page you're looking for doesn't exist or may have been moved.</p>
    <Link to="/" className="btn-primary mt-6">Back to home</Link>
  </div>
);

export default NotFound;
