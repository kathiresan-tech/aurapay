import React, { useState } from 'react';
import { P2PRecipient } from '../types/assistant';
import { resolveUpiRecipient } from '../data/mockRecipients';
import {
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CreditCard,
  Building2,
  Info,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface NewUserPayStepProps {
  onProceedWithNewUser: (recipient: P2PRecipient, amount: number) => void;
  onCancel: () => void;
  defaultAmount?: number;
}

export const NewUserPayStep: React.FC<NewUserPayStepProps> = ({
  onProceedWithNewUser,
  onCancel,
  defaultAmount,
}) => {
  const [inputUpi, setInputUpi] = useState('');
  const [resolvedUser, setResolvedUser] = useState<P2PRecipient | null>(null);
  const [amount, setAmount] = useState<number>(defaultAmount || 500);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleLookup = () => {
    if (!inputUpi.trim()) return;
    sound.playTap();
    setIsLookingUp(true);

    setTimeout(() => {
      setIsLookingUp(false);
      sound.playSuccess();
      const resolved = resolveUpiRecipient(inputUpi.trim(), amount);
      setResolvedUser(resolved);
    }, 700);
  };

  const handleProceed = () => {
    if (!resolvedUser) return;
    sound.playTap();
    onProceedWithNewUser(resolvedUser, amount);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
          <button
            onClick={() => {
              sound.playTap();
              onCancel();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Pay New User</h2>
            <p className="text-xs text-sky-300 font-medium">Demo recipient lookup & safety check</p>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="p-3.5 rounded-2xl bg-sky-950 border-2 border-sky-600/70 text-sky-100 shadow-md">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              New Recipient Protocol
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            This demo compares the entered UPI ID with sample records, then shows a first-payment safety check. It does not query a bank.
          </p>
        </div>

        {/* UPI ID Input Form */}
        <div className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 space-y-3">
          <label className="text-xs font-bold text-white block">
            Enter New User’s UPI ID or Mobile Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUpi}
              onChange={(e) => {
                setInputUpi(e.target.value);
                setResolvedUser(null);
              }}
              placeholder="e.g. ankit.verma@okhdfcbank"
              className="flex-1 bg-slate-900 border-2 border-slate-600 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 font-mono"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={!inputUpi.trim() || isLookingUp}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-sm"
            >
              {isLookingUp ? 'Matching...' : 'Lookup'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Try: <code>rahul.sharma@okhdfcbank</code> or <code>priya.verma@icici</code></span>
          </div>
        </div>

        {/* Bank-Resolved Recipient Card */}
        {resolvedUser && (
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-sky-400 space-y-3 shadow-lg animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-sky-300">
                  Simulated account-name lookup
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  {resolvedUser.resolvedName}
                </h3>
                <p className="font-mono text-xs text-sky-300 font-bold mt-0.5">{resolvedUser.upiId}</p>
                <p className="text-xs text-slate-300 mt-1 font-medium">{resolvedUser.bankName}</p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-200 border-2 border-sky-500">
                  Account Name Matched
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  Not verified safe
                </span>
              </div>
            </div>

            {/* Crucial Explanation Box */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 leading-relaxed space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Name Match Notice
              </span>
              <p>
                This simulated name match only reflects sample data; it does not contact a bank and <strong>does not prove this person or their request is trustworthy</strong>.
              </p>
            </div>

            {/* Enter Amount */}
            <div className="pt-2 border-t border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Transfer Amount</label>
                {amount > 10000 && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500 px-2 py-0.5 rounded-full font-bold">
                    2-Step Auth Required (&gt;₹10k)
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-lg font-bold text-slate-300">₹</span>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount..."
                  className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl pl-9 pr-3 py-2 text-base font-bold text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2 text-xs pt-1">
                {[500, 2000, 5000, 15000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setAmount(amt);
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      amount === amt
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-slate-700/80 border-slate-600 text-slate-200 hover:text-white'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')} {amt > 10000 && '🛡️'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4 border-t border-slate-700">
        <button
          onClick={handleProceed}
          disabled={!resolvedUser || !amount || amount <= 0}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            !resolvedUser || !amount || amount <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
          }`}
        >
          <span>Proceed to First-Payment Safety Check</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

