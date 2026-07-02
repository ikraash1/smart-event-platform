import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ScanLine, Pause, Play } from 'lucide-react';
import api from '../api/axios';
import QRScanner from '../components/tickets/QRScanner';

const ScanQR = () => {
  const [active, setActive] = useState(true);
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleScan = useCallback(async (ticketCode) => {
    setVerifying(true);
    try {
      const { data } = await api.post('/tickets/verify', { ticketCode });
      setResult({ valid: true, message: data.message, ticket: data.ticket });
      toast.success('Entry granted');
    } catch (err) {
      const data = err.response?.data;
      setResult({ valid: false, message: data?.message || 'Verification failed', ticket: data?.ticket });
      toast.error(data?.message || 'Invalid ticket');
    } finally {
      setVerifying(false);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 mb-1">
        <ScanLine className="text-brand-600" size={22} />
        <h1 className="font-display font-bold text-2xl text-ink-900">Scan Entry Ticket</h1>
      </div>
      <p className="text-slate-500 text-sm">Point the camera at an attendee's QR ticket to verify and check them in.</p>

      <div className="card p-6 mt-6">
        <QRScanner active={active} onScan={handleScan} />
        <div className="flex justify-center mt-4">
          <button onClick={() => setActive((a) => !a)} className="btn-secondary">
            {active ? <><Pause size={15} /> Pause scanner</> : <><Play size={15} /> Resume scanner</>}
          </button>
        </div>
      </div>

      {verifying && <p className="text-center text-sm text-slate-400 mt-4">Verifying ticket...</p>}

      {result && (
        <div className={`card p-5 mt-5 border-2 ${result.valid ? 'border-emerald-300' : 'border-rose-300'}`}>
          <div className="flex items-center gap-3">
            {result.valid ? (
              <CheckCircle2 className="text-emerald-500" size={32} />
            ) : (
              <XCircle className="text-rose-500" size={32} />
            )}
            <div>
              <p className={`font-display font-semibold text-lg ${result.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result.valid ? 'Entry Granted' : 'Entry Denied'}
              </p>
              <p className="text-sm text-slate-500">{result.message}</p>
            </div>
          </div>

          {result.ticket && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 grid grid-cols-2 gap-2">
              <p><span className="text-slate-400">Attendee:</span> {result.ticket.user?.name}</p>
              <p><span className="text-slate-400">Event:</span> {result.ticket.event?.title}</p>
              <p><span className="text-slate-400">Seat:</span> #{result.ticket.seatNumber}</p>
              <p><span className="text-slate-400">Status:</span> {result.ticket.status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanQR;
