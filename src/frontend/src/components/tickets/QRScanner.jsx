import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

/**
 * Wraps html5-qrcode to scan tickets using the device camera. Calls
 * onScan(decodedText) once per successful read, then pauses briefly to
 * avoid firing the same scan multiple times in a row.
 */
const QRScanner = ({ onScan, active }) => {
  const containerId = 'qr-scanner-region';
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const lastScanRef = useRef({ text: '', time: 0 });

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;
    let isMounted = true;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 240 },
        (decodedText) => {
          const now = Date.now();
          if (decodedText === lastScanRef.current.text && now - lastScanRef.current.time < 3000) {
            return; // debounce duplicate reads of the same code
          }
          lastScanRef.current = { text: decodedText, time: now };
          onScan(decodedText);
        },
        () => {} // ignore per-frame "no QR found" noise
      )
      .then(() => isMounted && setRunning(true))
      .catch((err) => isMounted && setError(err.message || 'Unable to access camera'));

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, [active, onScan]);

  return (
    <div>
      <div id={containerId} className="rounded-xl2 overflow-hidden bg-black aspect-square max-w-sm mx-auto" />
      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-500">
        {running ? (
          <span className="flex items-center gap-1.5 text-emerald-600"><Camera size={14} /> Camera active — point at a ticket QR code</span>
        ) : error ? (
          <span className="flex items-center gap-1.5 text-rose-600"><CameraOff size={14} /> {error}</span>
        ) : (
          <span>Starting camera...</span>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
