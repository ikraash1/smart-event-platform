import { CalendarDays, MapPin, Hash } from 'lucide-react';

const statusStyles = {
  valid: 'bg-emerald-50 text-emerald-700',
  used: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-rose-50 text-rose-700',
};

const TicketCard = ({ ticket }) => {
  const event = ticket.event || {};

  return (
    <div className="card overflow-hidden flex flex-col sm:flex-row">
      <div className="sm:w-40 bg-ink-900 flex items-center justify-center p-4">
        <img src={ticket.qrCodeImage} alt="QR ticket code" className="w-32 h-32 bg-white rounded-lg p-1" />
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-ink-900">{event.title}</h3>
          <span className={`badge ${statusStyles[ticket.status] || statusStyles.valid}`}>{ticket.status}</span>
        </div>
        <div className="mt-2 space-y-1 text-sm text-slate-500">
          {event.startDate && (
            <p className="flex items-center gap-1.5">
              <CalendarDays size={14} /> {new Date(event.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
          {event.venue && <p className="flex items-center gap-1.5"><MapPin size={14} /> {event.venue}</p>}
          <p className="flex items-center gap-1.5"><Hash size={14} /> Seat #{ticket.seatNumber} · Code: {ticket.ticketCode.slice(0, 8)}...</p>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
