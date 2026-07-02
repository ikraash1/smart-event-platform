import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket as TicketIcon } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import TicketCard from '../components/tickets/TicketCard';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get('/tickets/my');
        setTickets(data.tickets);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-2xl text-ink-900">My Tickets</h1>
      <p className="text-slate-500 text-sm mt-1">Show the QR code at the entrance to check in.</p>

      <div className="mt-6 space-y-4">
        {tickets.length === 0 ? (
          <EmptyState
            icon={TicketIcon}
            title="No tickets yet"
            message="Book an event to receive your first QR ticket here."
            action={<Link to="/events" className="btn-primary">Explore Events</Link>}
          />
        ) : (
          tickets.map((t) => <TicketCard key={t._id} ticket={t} />)
        )}
      </div>
    </div>
  );
};

export default MyTickets;
