import { Search, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'Technology', 'Business', 'Music', 'Sports', 'Education',
  'Health', 'Art & Culture', 'Networking', 'Food & Drink', 'Other',
];

const EventFilters = ({ filters, onChange }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by name, topic, or keyword..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => set('category', e.target.value)}
          className="input-field md:w-52"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => set('sortBy', e.target.value)}
          className="input-field md:w-52"
        >
          <option value="startDate">Sort: Date (soonest)</option>
          <option value="price">Sort: Price</option>
          <option value="viewCount">Sort: Most viewed</option>
          <option value="seatsBooked">Sort: Most popular</option>
        </select>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <SlidersHorizontal size={14} />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.upcoming === 'true'}
            onChange={(e) => set('upcoming', e.target.checked ? 'true' : '')}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-300"
          />
          Upcoming events only
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={filters.maxPrice === '0'}
            onChange={(e) => set('maxPrice', e.target.checked ? '0' : '')}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-300"
          />
          Free events only
        </label>
      </div>
    </div>
  );
};

export default EventFilters;
