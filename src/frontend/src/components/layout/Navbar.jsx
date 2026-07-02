import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, CalendarDays, LayoutDashboard, Ticket, ScanLine, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-ink-900">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center text-white">
            <CalendarDays size={18} />
          </span>
          EventSphere
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/events" className={linkClass}>Explore Events</NavLink>
          {user && <NavLink to="/recommendations" className={linkClass}>For You</NavLink>}
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <NavLink to="/organizer/dashboard" className={linkClass}>Organizer</NavLink>
          )}
          {user && user.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={linkClass}>Admin</NavLink>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/my-tickets" className="btn-secondary" title="My Tickets">
                <Ticket size={16} /> Tickets
              </Link>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/scan" className="btn-secondary" title="Scan QR">
                  <ScanLine size={16} /> Scan
                </Link>
              )}
              <Link to="/profile" className="btn-secondary" title="Profile">
                <User size={16} /> {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-danger" title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        <button className="md:hidden p-2 text-slate-700" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white">
          <NavLink to="/events" className={linkClass} onClick={() => setOpen(false)}>Explore Events</NavLink>
          {user && (
            <NavLink to="/recommendations" className={linkClass} onClick={() => setOpen(false)}>
              <span className="inline-flex items-center gap-1"><Sparkles size={14}/> For You</span>
            </NavLink>
          )}
          {user && (
            <NavLink to="/my-bookings" className={linkClass} onClick={() => setOpen(false)}>My Bookings</NavLink>
          )}
          {user && (
            <NavLink to="/my-tickets" className={linkClass} onClick={() => setOpen(false)}>My Tickets</NavLink>
          )}
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <NavLink to="/organizer/dashboard" className={linkClass} onClick={() => setOpen(false)}>
              <span className="inline-flex items-center gap-1"><LayoutDashboard size={14}/> Organizer Dashboard</span>
            </NavLink>
          )}
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <NavLink to="/scan" className={linkClass} onClick={() => setOpen(false)}>Scan QR</NavLink>
          )}
          {user && user.role === 'admin' && (
            <NavLink to="/admin/dashboard" className={linkClass} onClick={() => setOpen(false)}>Admin Dashboard</NavLink>
          )}
          {user && (
            <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>Profile</NavLink>
          )}
          <div className="pt-2">
            {!user ? (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary flex-1" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>Get started</Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="btn-danger w-full">
                <LogOut size={16} /> Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
