import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-slate-100 bg-white mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink-900">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white">
            <CalendarDays size={18} />
          </span>
          EventSphere
        </Link>
        <p className="text-sm text-slate-500 mt-3 max-w-xs">
          Discover, host, and manage events with QR ticketing, live analytics, and AI-powered
          recommendations.
        </p>
      </div>

      <div>
        <h4 className="font-display font-semibold text-sm text-ink-900 mb-3">Platform</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><Link to="/events" className="hover:text-brand-600">Explore Events</Link></li>
          <li><Link to="/register" className="hover:text-brand-600">Become an Organizer</Link></li>
          <li><Link to="/recommendations" className="hover:text-brand-600">Recommended For You</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display font-semibold text-sm text-ink-900 mb-3">Account</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><Link to="/login" className="hover:text-brand-600">Log in</Link></li>
          <li><Link to="/register" className="hover:text-brand-600">Create account</Link></li>
          <li><Link to="/profile" className="hover:text-brand-600">Profile settings</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display font-semibold text-sm text-ink-900 mb-3">Project</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>Smart Event Management Platform</li>
          <li>MERN Stack · JWT Auth · QR Ticketing</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
      &copy; {new Date().getFullYear()} EventSphere. Built as an academic / portfolio project.
    </div>
  </footer>
);

export default Footer;
