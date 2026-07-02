import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/events/EventCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [fallback, setFallback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const { data } = await api.get('/recommendations?limit=12');
        setRecs(data.recommendations);
        setFallback(data.fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2">
        <Sparkles className="text-accent-500" size={22} />
        <h1 className="font-display font-bold text-2xl text-ink-900">Recommended for you</h1>
      </div>
      <p className="text-slate-500 text-sm mt-1">
        {fallback === 'trending'
          ? 'Trending on the platform — book a few events to get personalized picks.'
          : 'Based on your interests, booking history, and what\'s currently popular.'}
      </p>

      {loading ? (
        <Loader />
      ) : recs.length === 0 ? (
        <EmptyState icon={Sparkles} title="No recommendations yet" message="Check back once more events are published." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {recs.map(({ event, score, reasons }) => (
            <div key={event._id} className="relative">
              <EventCard event={event} />
              {score !== null && (
                <span className="badge absolute -top-2 -right-2 bg-ink-900 text-white shadow-md" title={JSON.stringify(reasons)}>
                  {Math.round(score * 100)}% match
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
