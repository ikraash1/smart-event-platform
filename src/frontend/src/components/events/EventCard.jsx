import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Tag, Users } from 'lucide-react';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

const categoryColors = {
  Technology: 'bg-indigo-50 text-indigo-700',
  Business: 'bg-amber-50 text-amber-700',
  Music: 'bg-pink-50 text-pink-700',
  Sports: 'bg-emerald-50 text-emerald-700',
  Education: 'bg-blue-50 text-blue-700',
  Health: 'bg-rose-50 text-rose-700',
  'Art & Culture': 'bg-purple-50 text-purple-700',
  Networking: 'bg-cyan-50 text-cyan-700',
  'Food & Drink': 'bg-orange-50 text-orange-700',
  Other: 'bg-slate-100 text-slate-700',
};

const EventCard = ({ event }) => {
  const seatsLeft = event.capacity - event.seatsBooked;
  const isFull = seatsLeft <= 0;
  const isSoon =
    new Date(event.startDate) - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
    new Date(event.startDate) > Date.now();

  return (
    <Link
      to={`/events/${event._id}`}
      className="card group overflow-hidden flex flex-col hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-40 bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="text-white/40" size={42} />
          </div>
        )}
        <span className={`badge absolute top-3 left-3 ${categoryColors[event.category] || categoryColors.Other}`}>
          <Tag size={12} className="mr-1" /> {event.category}
        </span>
        {isSoon && !isFull && (
          <span className="badge absolute top-3 right-3 bg-accent-500 text-white">Starting soon</span>
        )}
        {isFull && (
          <span className="badge absolute top-3 right-3 bg-rose-600 text-white">Sold out</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-ink-900 leading-snug line-clamp-2 group-hover:text-brand-700">
          {event.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-sm text-slate-500">
          <p className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(event.startDate)}</p>
          <p className="flex items-center gap-1.5 truncate"><MapPin size={14} /> {event.isOnline ? 'Online event' : event.venue}</p>
          <p className="flex items-center gap-1.5"><Users size={14} /> {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully booked'}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="font-display font-bold text-ink-900">
            {event.price > 0 ? `PKR ${event.price.toLocaleString()}` : 'Free'}
          </span>
          <span className="text-sm font-semibold text-brand-600 group-hover:underline">View details →</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
