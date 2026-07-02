import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Ticket, DollarSign, Users, Plus, Pencil, Eye } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/dashboard/StatCard';
import TrendLineChart from '../components/dashboard/TrendLineChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import PopularEventsBarChart from '../components/dashboard/PopularEventsBarChart';
import { useAuth } from '../context/AuthContext';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [popularEvents, setPopularEvents] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [bookingTrend, setBookingTrend] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, pop, cat, trend, events] = await Promise.all([
          api.get('/analytics/organizer/overview'),
          api.get('/analytics/popular-events?limit=5'),
          api.get('/analytics/bookings-by-category'),
          api.get('/analytics/booking-trend?days=14'),
          api.get('/events', { params: { organizer: user._id, status: '', limit: 50 } }),
        ]);
        setOverview(ov.data.overview);
        setPopularEvents(pop.data.events);
        setCategoryData(cat.data.data);
        setBookingTrend(trend.data.data);
        setMyEvents(events.data.events);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Organizer Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your events and track performance.</p>
        </div>
        <Link to="/events/create" className="btn-primary"><Plus size={16} /> Create event</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard icon={CalendarDays} label="Total Events" value={overview?.totalEvents ?? 0} color="brand" />
        <StatCard icon={Ticket} label="Confirmed Bookings" value={overview?.totalBookings ?? 0} color="accent" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`PKR ${(overview?.totalRevenue ?? 0).toLocaleString()}`} color="emerald" />
        <StatCard icon={Users} label="Total Check-ins" value={overview?.totalAttendance ?? 0} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Booking trend (last 14 days)</h2>
          <TrendLineChart data={bookingTrend} lines={[{ key: 'bookings', label: 'Bookings' }, { key: 'revenue', label: 'Revenue (PKR)' }]} />
        </div>
        <div className="card p-5">
          <h2 className="font-display font-semibold text-ink-900 mb-3">Bookings by category</h2>
          <CategoryPieChart data={categoryData} />
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h2 className="font-display font-semibold text-ink-900 mb-3">Your most popular events</h2>
        <PopularEventsBarChart data={popularEvents} />
      </div>

      <div className="mt-8">
        <h2 className="font-display font-semibold text-lg text-ink-900 mb-3">Your events</h2>
        {myEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="You haven't created any events yet"
            action={<Link to="/events/create" className="btn-primary"><Plus size={16} /> Create your first event</Link>}
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Seats</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEvents.map((e) => (
                  <tr key={e._id}>
                    <td className="px-4 py-3 font-medium text-ink-900">{e.title}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(e.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                    <td className="px-4 py-3 text-slate-500">{e.seatsBooked}/{e.capacity}</td>
                    <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600 capitalize">{e.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/events/${e._id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="View"><Eye size={15} /></Link>
                        <Link to={`/events/${e._id}/edit`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit"><Pencil size={15} /></Link>
                        <Link to={`/events/${e._id}/attendees`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Attendees"><Users size={15} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
