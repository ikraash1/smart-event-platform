import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, MapPin, ClipboardList, X } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const statusStyles = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
  pending: 'bg-amber-50 text-amber-700',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async () => {
    try {
      await api.put(`/bookings/${target._id}/cancel`);
      toast.success('Booking cancelled');
      setTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-ink-900">My Bookings</h1>
      <p className="text-slate-500 text-sm mt-1">A history of all the events you&apos;ve booked.</p>

      <div className="mt-6 space-y-3">
        {bookings.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No bookings yet"
            message="Browse upcoming events and book your first ticket."
            action={<Link to="/events" className="btn-primary">Explore Events</Link>}
          />
        ) : (
          bookings.map((b) => (
            <div key={b._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-ink-900">{b.event?.title || 'Event removed'}</h3>
                  <span className={`badge ${statusStyles[b.status]}`}>{b.status}</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-slate-500">
                  {b.event?.startDate && (
                    <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {new Date(b.event.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  )}
                  {b.event?.venue && <span className="flex items-center gap-1.5"><MapPin size={14} /> {b.event.venue}</span>}
                  <span>Ref: {b.bookingReference}</span>
                  <span>Qty: {b.quantity}</span>
                  <span className="font-medium text-ink-700">{b.totalAmount > 0 ? `PKR ${b.totalAmount.toLocaleString()}` : 'Free'}</span>
                </div>
              </div>
              {b.status === 'confirmed' && (
                <button onClick={() => setTarget(b)} className="btn-danger shrink-0"><X size={14} /> Cancel</button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={!!target} onClose={() => setTarget(null)} title="Cancel this booking?">
        <p className="text-sm text-slate-600">
          This will void your QR ticket(s) for <strong>{target?.event?.title}</strong> and release the seats back to the event.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setTarget(null)} className="btn-secondary">Keep booking</button>
          <button onClick={handleCancel} className="btn-danger">Cancel booking</button>
        </div>
      </Modal>
    </div>
  );
};

export default MyBookings;
