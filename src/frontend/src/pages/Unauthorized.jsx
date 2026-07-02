import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <ShieldAlert className="text-rose-400 mb-4" size={56} />
    <h1 className="font-display font-bold text-3xl text-ink-900">403 — Access denied</h1>
    <p className="text-slate-500 mt-2 max-w-sm">You don't have permission to view this page with your current account role.</p>
    <Link to="/" className="btn-primary mt-6">Back to home</Link>
  </div>
);

export default Unauthorized;
