import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, QrCode, BarChart3, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import EventCard from '../components/events/EventCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/recommendations/trending?limit=6');
        setTrending(data.events);
      } catch {
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(251,146,60,0.25),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <span className="badge bg-white/10 text-white mb-5">
            <Sparkles size={13} className="mr-1.5" /> AI-powered recommendations, built in
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight max-w-3xl mx-auto">
            Run unforgettable events, end to end.
          </h1>
          <p className="text-slate-300 text-lg mt-5 max-w-2xl mx-auto">
            Publish events, sell QR-verified tickets, scan attendees at the door, and watch your
            growth in a live analytics dashboard — all from one platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/events" className="btn-accent text-base px-7 py-3">
              Explore Events <ArrowRight size={18} />
            </Link>
            {!user && (
              <Link to="/register" className="btn-secondary text-base px-7 py-3 bg-white/10 text-white border-white/20 hover:bg-white/20">
                Become an Organizer
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: CalendarDays, title: 'Effortless event creation', desc: 'Publish events with categories, pricing, capacity, and online or in-person venues.' },
            { icon: QrCode, title: 'QR ticketing built in', desc: 'Every booking generates a signed, scannable QR ticket — no third-party tools needed.' },
            { icon: BarChart3, title: 'Live analytics', desc: 'Track bookings, revenue, attendance, and category trends as they happen.' },
            { icon: Sparkles, title: 'Smart recommendations', desc: 'Attendees get personalized event suggestions based on interests and history.' },
          ].map((f) => (
            <div key={f.title} className="card p-5">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <f.icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-ink-900">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-ink-900">Trending right now</h2>
            <p className="text-slate-500 text-sm mt-1">The most booked and viewed events on the platform.</p>
          </div>
          <Link to="/events" className="text-sm font-semibold text-brand-600 hover:underline whitespace-nowrap">
            View all →
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : trending.length === 0 ? (
          <p className="text-slate-400 text-sm">No events published yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trending.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        )}
      </section>

      {/* Security / trust strip */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <ShieldCheck size={20} className="text-accent-400" />
          <p className="text-sm text-slate-200">
            Secured with JWT authentication, hashed passwords, and signed QR tickets that can&apos;t be forged or reused.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
