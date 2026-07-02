import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle2, Circle } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const AttendeeManagement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventRes, attendeesRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/attendees`),
        ]);
        setEvent(eventRes.data.event);
        setAttendees(attendeesRes.data.attendees);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link to={`/events/${id}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-5">
        <ArrowLeft size={16} /> Back to event
      </Link>

      <div className="flex items-center gap-2">
        <Users className="text-brand-600" size={22} />
        <h1 className="font-display font-bold text-2xl text-ink-900">Attendees</h1>
      </div>
      <p className="text-slate-500 text-sm mt-1">{event?.title} · {attendees.length} booking(s)</p>

      <div className="mt-6">
        {attendees.length === 0 ? (
          <EmptyState icon={Users} title="No attendees yet" message="Bookings will appear here once attendees register." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Attendee</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Check-in status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendees.map((a) => (
                  <tr key={a.booking}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{a.user?.name}</p>
                      <p className="text-xs text-slate-400">{a.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{a.bookingReference}</td>
                    <td className="px-4 py-3 text-slate-500">{a.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {a.tickets.map((t, i) => (
                          <span key={i} className={`badge ${t.checkedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {t.checkedIn ? <CheckCircle2 size={12} className="mr-1" /> : <Circle size={12} className="mr-1" />}
                            Seat {i + 1}
                          </span>
                        ))}
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

export default AttendeeManagement;
