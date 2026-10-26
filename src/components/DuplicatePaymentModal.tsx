/**
 * DuplicatePaymentModal — shown when a suspicious repeated payment is detected.
 * The user must actively confirm they want to proceed.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, ShieldAlert } from 'lucide-react';
import type { DuplicateWarning } from '../utils/detectDuplicate';
import { sound } from '../utils/audioEffects';

interface DuplicatePaymentModalProps {
  warning: DuplicateWarning;
  amount: number;
  upiOrRef: string;
  recipientName: string;
  onProceedAnyway: () => void;
  onCancel: () => void;
}

export const DuplicatePaymentModal: React.FC<DuplicatePaymentModalProps> = ({
  warning,
  amount,
  upiOrRef,
  recipientName,
  onProceedAnyway,
  onCancel,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-rose-500 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-5 py-4 bg-rose-950 border-b border-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span className="font-extrabold text-rose-200 text-sm uppercase tracking-wide">
              Repeated Payment Alert
            </span>
          </div>
          <button
            onClick={() => { sound.playTap(); onCancel(); }}
            className="p-1.5 rounded-lg bg-rose-900/60 text-rose-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-700 space-y-2.5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-100 font-semibold leading-relaxed">
                You have already sent{' '}
                <strong className="text-white">
                  ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>{' '}
                to <strong className="text-white">{recipientName}</strong> ({upiOrRef}) at least{' '}
                <strong className="text-rose-300">
                  {warning.count} time{warning.count !== 1 ? 's' : ''}
                </strong>{' '}
                in the past{' '}
                <strong className="text-rose-300">{warning.windowHours} hour{warning.windowHours !== 1 ? 's' : ''}</strong>.
              </p>
            </div>

            {warning.firstOccurrence && warning.lastOccurrence && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                  <span className="text-slate-400 block">First payment</span>
                  <span className="font-bold text-white">{warning.firstOccurrence}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                  <span className="text-slate-400 block">Last payment</span>
                  <span className="font-bold text-white">{warning.lastOccurrence}</span>
                </div>
              </div>
            )}
          </div>

          {/* Scam warning */}
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-xs text-amber-200 space-y-1.5">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Common scam patterns include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-200/80">
              <li>Split-payment requests ("send ₹X three times")</li>
              <li>Repeated refund/cashback traps</li>
              <li>Someone controlling your screen remotely</li>
            </ul>
          </div>

          {/* Confirm checkbox */}
          <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-500"
            />
            <span>
              I understand this is a repeated payment. I am sending it intentionally and am not
              being instructed by anyone.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={() => { sound.playTap(); onCancel(); }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition cursor-pointer"
          >
            Cancel Payment
          </button>
          <button
            onClick={() => { if (confirmed) { sound.playTap(); onProceedAnyway(); } }}
            disabled={!confirmed}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              confirmed
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            Proceed Anyway
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
