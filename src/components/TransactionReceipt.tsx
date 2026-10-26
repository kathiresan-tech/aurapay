import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Share2,
  Home,
  Building2,
  Clock,
  Hash,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface TransactionReceiptProps {
  type: 'BILL' | 'P2P' | 'MERCHANT';
  title: string;
  recipientOrBiller: string;
  accountReference: string;
  amount: number;
  utrNumber: string;
  timestamp: string;
  paymentMethod: string;
  warningNote?: string;
  onReturnHome: () => void;
  onViewHistory: () => void;
}

export const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  type,
  title,
  recipientOrBiller,
  accountReference,
  amount,
  utrNumber,
  timestamp,
  paymentMethod,
  warningNote,
  onReturnHome,
  onViewHistory,
}) => {
  useEffect(() => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#34d399', '#60a5fa'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div className="space-y-4 pt-2">
        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-md">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Simulated Payment Completed
            </h2>
            <p className="text-xs text-emerald-300 font-bold">
              Mock transaction authorized successfully
            </p>
          </div>

          {/* Amount Paid */}
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white pt-1">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* PROTOTYPE BANNER WATERMARK */}
        <div className="p-3 rounded-xl bg-amber-950 border-2 border-amber-500 text-amber-100 text-center space-y-0.5 shadow-md">
          <span className="text-xs font-extrabold uppercase tracking-wider block text-amber-300">
            Prototype Demo — No Real Payment Sent
          </span>
          <span className="text-[11px] text-amber-200 font-medium block">
            No money has been debited from any real bank account.
          </span>
        </div>

        {/* Detailed Receipt Card */}
        <div className="rounded-2xl bg-slate-800 border-2 border-slate-700 p-4 space-y-3.5 text-xs sm:text-sm shadow-lg">
          <div className="flex justify-between items-start pb-3 border-b border-slate-700">
            <div>
              <span className="text-xs uppercase font-bold text-sky-300 block">
                {type === 'BILL' ? 'Paid to Verified Biller' : 'Transferred to Recipient'}
              </span>
              <span className="font-extrabold text-white text-base block mt-0.5">
                {recipientOrBiller}
              </span>
              <span className="font-mono text-xs text-sky-300 font-semibold block mt-0.5">
                {accountReference}
              </span>
            </div>

            {type === 'BILL' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                BBPS Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-200 border border-sky-500 shrink-0">
                Account Matched
              </span>
            )}
          </div>

          {/* Metadata Rows */}
          <div className="space-y-2.5 text-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Hash className="w-4 h-4 text-sky-400" />
                <span>UPI Reference (UTR)</span>
              </span>
              <span className="font-mono text-white text-xs font-bold">{utrNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Transaction Time</span>
              </span>
              <span className="text-white text-xs font-semibold">{timestamp}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Debited Account</span>
              </span>
              <span className="text-white text-xs font-semibold">{paymentMethod}</span>
            </div>
          </div>

          {warningNote && (
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-600 text-xs text-amber-200 flex items-start gap-2 mt-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{warningNote}</span>
            </div>
          )}
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center justify-center gap-6 text-xs text-sky-300 font-bold pt-1">
          <button
            onClick={() => {
              sound.playTap();
              alert('Receipt downloaded (simulated text file).');
            }}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save Receipt</span>
          </button>
          <span>•</span>
          <button
            onClick={() => {
              sound.playTap();
              alert('Receipt link copied to clipboard (simulated).');
            }}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Receipt</span>
          </button>
        </div>
      </div>

      {/* Bottom Primary Actions */}
      <div className="pt-4 border-t border-slate-700 space-y-2.5">
        <button
          onClick={() => {
            sound.playTap();
            onReturnHome();
          }}
          className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/30"
        >
          <Home className="w-5 h-5" />
          <span>Done • Return to Home</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onViewHistory();
          }}
          className="w-full py-2 text-xs text-sky-300 hover:text-white font-medium transition text-center cursor-pointer"
        >
          View in simulated transaction history
        </button>
      </div>
    </div>
  );
};
