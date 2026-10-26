/**
 * QR Scanner Step — Camera-based UPI QR Code reader using jsQR.
 *
 * PROTOTYPE: Accesses device camera to scan UPI-format QR codes.
 * Parsed data is routed to the appropriate payment flow.
 * No real transaction is initiated.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  ArrowLeft,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

export interface QRPaymentData {
  upiId: string;
  name: string;
  amount?: number;
  note?: string;
  rawQr: string;
}

interface QRScannerStepProps {
  onQRScanned: (data: QRPaymentData) => void;
  onCancel: () => void;
}

/** Parse a UPI deep-link or plain UPI ID string */
function parseUpiQR(raw: string): QRPaymentData | null {
  const trimmed = raw.trim();

  // Standard UPI deep-link: upi://pay?pa=id@bank&pn=Name&am=500&tn=Note
  if (trimmed.toLowerCase().startsWith('upi://')) {
    try {
      const url = new URL(trimmed);
      const pa = url.searchParams.get('pa') || '';
      const pn = url.searchParams.get('pn') || '';
      const am = url.searchParams.get('am');
      const tn = url.searchParams.get('tn') || '';
      if (!pa) return null;
      return {
        upiId: pa,
        name: pn || pa.split('@')[0],
        amount: am ? parseFloat(am) : undefined,
        note: tn || undefined,
        rawQr: raw,
      };
    } catch {
      return null;
    }
  }

  // Bare UPI ID pattern (xxx@yyy)
  if (/^[a-zA-Z0-9._\-+]+@[a-zA-Z0-9]+$/.test(trimmed)) {
    return {
      upiId: trimmed,
      name: trimmed.split('@')[0],
      rawQr: raw,
    };
  }

  return null;
}

/** Demo QR codes for prototype testing */
const DEMO_QRS: { label: string; qr: string }[] = [
  {
    label: 'Scan: Rahul Kumar ₹500',
    qr: 'upi://pay?pa=rahul.kumar@okaxis&pn=Rahul%20Kumar&am=500&tn=Split%20dinner',
  },
  {
    label: 'Scan: Coffee Shop ₹250',
    qr: 'upi://pay?pa=coffeeplace@upi&pn=The%20Coffee%20Place&am=250&tn=Coffee',
  },
  {
    label: 'Scan: Plain UPI ID',
    qr: 'demo.merchant@okhdfc',
  },
];

export const QRScannerStep: React.FC<QRScannerStepProps> = ({ onQRScanned, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [camState, setCamState] = useState<'idle' | 'requesting' | 'active' | 'error'>('idle');
  const [camError, setCamError] = useState<string | null>(null);
  const [scanned, setScanned] = useState<QRPaymentData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      stopCamera();
      const parsed = parseUpiQR(code.data);
      if (parsed) {
        sound.playSuccess();
        setScanned(parsed);
        setCamState('idle');
      } else {
        setScanError(`QR found but not a UPI code:\n"${code.data.slice(0, 60)}..."`);
        setCamState('error');
      }
      return;
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCamState('requesting');
    setCamError(null);
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCamState('active');
        animFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      setCamState('error');
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : err?.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : `Camera error: ${err?.message || 'Unknown error'}`;
      setCamError(msg);
    }
  }, [tick]);

  // Stop camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleDemoQR = (qr: string) => {
    const parsed = parseUpiQR(qr);
    if (parsed) {
      sound.playSuccess();
      setScanned(parsed);
    }
  };

  const handleProceed = () => {
    if (scanned) {
      sound.playTap();
      onQRScanned(scanned);
    }
  };

  const handleRetry = () => {
    setScanned(null);
    setScanError(null);
    setCamState('idle');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
        <button
          onClick={() => { sound.playTap(); stopCamera(); onCancel(); }}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            Scan QR Code to Pay
          </h2>
          <p className="text-xs text-slate-300">Point camera at any UPI QR code</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 p-4">
        {/* Result: scanned OK */}
        {scanned && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-100 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                QR Code Scanned Successfully
              </div>
              <div className="bg-slate-900/60 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">UPI ID</span>
                  <span className="font-bold text-white font-mono">{scanned.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Name</span>
                  <span className="font-bold text-white">{scanned.name}</span>
                </div>
                {scanned.amount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount</span>
                    <span className="font-bold text-emerald-300">
                      ₹{scanned.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {scanned.note && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Note</span>
                    <span className="font-medium text-slate-200">{scanned.note}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-emerald-300/80 italic">
                UPI ID looked up from QR — name match will be verified before payment.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Scan Again
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm shadow-lg shadow-sky-500/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        )}

        {/* Camera Viewfinder */}
        {!scanned && (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-700 aspect-square max-h-64 w-full flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${camState === 'active' ? 'block' : 'hidden'}`}
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {camState !== 'active' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
                  <Camera className="w-12 h-12 text-slate-500" />
                  {camState === 'requesting' && (
                    <p className="text-xs text-slate-300 font-medium">
                      Requesting camera permission...
                    </p>
                  )}
                  {camState === 'idle' && (
                    <p className="text-xs text-slate-400 font-medium">
                      Camera not started
                    </p>
                  )}
                  {camState === 'error' && (
                    <p className="text-xs text-rose-300 font-medium">
                      {camError || scanError || 'Camera error'}
                    </p>
                  )}
                </div>
              )}

              {/* Scan frame overlay */}
              {camState === 'active' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-40 border-2 border-sky-400 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br" />
                    <ScanLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 text-sky-400/60 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Camera controls */}
            {camState === 'idle' || camState === 'error' ? (
              <button
                onClick={startCamera}
                className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                {camState === 'error' ? 'Retry Camera' : 'Start Camera'}
              </button>
            ) : camState === 'active' ? (
              <button
                onClick={() => { stopCamera(); setCamState('idle'); }}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Stop Camera
              </button>
            ) : null}

            {/* Demo QR codes for prototype testing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                  Prototype Demo QRs
                </span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                No physical QR? Tap a demo code below to simulate scanning.
              </p>
              <div className="flex flex-col gap-2">
                {DEMO_QRS.map((d) => (
                  <button
                    key={d.qr}
                    onClick={() => { sound.playTap(); handleDemoQR(d.qr); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 hover:border-sky-500 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4 text-sky-400 shrink-0" />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BBPS bill QR note */}
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700/50 text-[11px] text-amber-200/80 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Always verify the merchant or recipient name after scanning before proceeding.
                QR codes can be tampered with. This is a prototype — no real payment is sent.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
