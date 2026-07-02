import { useEffect, useState, useCallback } from 'react';
import { CalendarSearch } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/events/EventCard';
import EventFilters from '../components/events/EventFilters';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const DEFAULT_FILTERS = { search: '', category: '', sortBy: 'startDate', upcoming: 'true', maxPrice: '' };

const Events = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/events', { params });
      setEvents(data.events);
      setPagination(data.pagination);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(1), 350); // debounce search typing
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-900">Explore Events</h1>
      <p className="text-slate-500 text-sm mt-1">Search, filter, and book your next event.</p>

      <div className="mt-6">
        <EventFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <Loader />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarSearch}
          title="No events found"
          message="Try adjusting your filters or check back later for new events."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => <EventCard key={event._id} event={event} />)}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchEvents(p)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium ${
                    p === pagination.page ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
