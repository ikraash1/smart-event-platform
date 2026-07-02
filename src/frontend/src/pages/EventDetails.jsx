import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDays, MapPin, Users, Tag, Pencil, Trash2, Ticket as TicketIcon, ArrowLeft, UserCircle2,
} from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bookedTickets, setBookedTickets] = useState(null);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data.event);
    } catch {
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const isOwner = user && event && (user._id === event.organizer?._id || user.role === 'admin');
  const seatsLeft = event ? event.capacity - event.seatsBooked : 0;

  const handleBook = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setBooking(true);
    try {
      const { data } = await api.post('/bookings', { eventId: id, quantity });
      toast.success('Booking confirmed! Your QR ticket is ready.');
      setBookedTickets(data.tickets);
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/organizer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!event) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-5">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="h-56 sm:h-72 rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden flex items-center justify-center">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <CalendarDays className="text-white/40" size={64} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2">
          <span className="badge bg-brand-50 text-brand-700"><Tag size={12} className="mr-1" /> {event.category}</span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink-900 mt-3">{event.title}</h1>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-brand-500" /> {new Date(event.startDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
            <span className="flex items-center gap-1.5"><MapPin size={16} className="text-brand-500" /> {event.isOnline ? 'Online event' : `${event.venue}${event.address ? ', ' + event.address : ''}`}</span>
            <span className="flex items-center gap-1.5"><Users size={16} className="text-brand-500" /> {seatsLeft} of {event.capacity} seats left</span>
          </div>

          <div className="mt-6">
            <h2 className="font-display font-semibold text-lg text-ink-900 mb-2">About this event</h2>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">{event.description}</p>
          </div>

          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {event.tags.map((tag) => <span key={tag} className="badge bg-slate-100 text-slate-600">{tag}</span>)}
            </div>
          )}

          {event.organizer && (
            <div className="card p-4 mt-6 flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                <UserCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Organized by</p>
                <p className="font-medium text-ink-900">{event.organizer.name}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <p className="font-display font-bold text-2xl text-ink-900">
              {event.price > 0 ? `PKR ${event.price.toLocaleString()}` : 'Free'}
            </p>
            <p className="text-xs text-slate-400 mb-4">per ticket</p>

            {isOwner ? (
              <div className="space-y-2">
                <Link to={`/events/${event._id}/edit`} className="btn-secondary w-full"><Pencil size={15} /> Edit event</Link>
                <Link to={`/events/${event._id}/attendees`} className="btn-secondary w-full"><Users size={15} /> View attendees</Link>
                <button onClick={() => setConfirmDelete(true)} className="btn-danger w-full"><Trash2 size={15} /> Delete event</button>
              </div>
            ) : seatsLeft <= 0 ? (
              <button disabled className="btn-primary w-full">Sold out</button>
            ) : new Date(event.startDate) < new Date() ? (
              <button disabled className="btn-primary w-full">Event has ended</button>
            ) : (
              <>
                <label className="block text-sm font-medium text-ink-800 mb-1.5">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={Math.min(seatsLeft, 10)}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), seatsLeft)))}
                  className="input-field mb-3"
                />
                <button onClick={handleBook} disabled={booking} className="btn-primary w-full">
                  <TicketIcon size={16} /> {booking ? 'Booking...' : `Book ${quantity > 1 ? `${quantity} tickets` : 'now'}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this event?">
        <p className="text-sm text-slate-600">
          This will permanently delete the event along with all of its bookings, tickets, and attendance records. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setConfirmDelete(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete permanently</button>
        </div>
      </Modal>

      <Modal isOpen={!!bookedTickets} onClose={() => setBookedTickets(null)} title="Booking confirmed!">
        <p className="text-sm text-slate-600 mb-4">Your QR ticket{bookedTickets?.length > 1 ? 's are' : ' is'} ready. Show this at the entrance for check-in.</p>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {bookedTickets?.map((t) => (
            <div key={t._id} className="flex items-center gap-3 border border-slate-100 rounded-xl p-3">
              <img src={t.qrCodeImage} alt="QR ticket" className="w-20 h-20" />
              <div className="text-sm">
                <p className="font-medium text-ink-900">Seat #{t.seatNumber}</p>
                <p className="text-slate-400 text-xs">{t.ticketCode.slice(0, 12)}...</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/my-tickets" className="btn-primary w-full mt-4" onClick={() => setBookedTickets(null)}>
          View all my tickets
        </Link>
      </Modal>
    </div>
  );
};

export default EventDetails;
