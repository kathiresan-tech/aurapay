import React from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  Gift,
  RotateCcw,
  Briefcase,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface ScamEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScamEducationModal: React.FC<ScamEducationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border-2 border-amber-500 text-amber-300">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Payment Safety & Scam Prevention
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                Understanding First-Payment Safeguards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-200">
          {/* NPCI Golden Rule */}
          <div className="p-4 rounded-2xl bg-sky-950 border-2 border-sky-500 space-y-2 shadow-md">
            <span className="text-xs uppercase font-extrabold tracking-wider text-sky-300 block">
              The Fundamental Rule of UPI
            </span>
            <p className="text-white font-bold text-xs sm:text-sm leading-relaxed">
              Entering your UPI PIN <strong className="text-amber-300 underline">ALWAYS debits (deducts) money</strong> from your account. You NEVER need to enter your PIN or send a payment to receive money, refunds, or cashback.
            </p>
          </div>

          {/* Account Match Explanation */}
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-sm">Why “Account Name Matched” is NOT “Verified Safe”</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              When you pay a person, the banking system looks up the name registered on that account. A match merely confirms that the account exists. It does <em>not</em> mean the person is trustworthy, honest, or authorized. Fraudsters frequently use mule or stolen accounts with real names.
            </p>
          </div>

          {/* Common Scam Patterns */}
          <div className="space-y-3 pt-1">
            <span className="text-xs uppercase font-bold tracking-wider text-sky-300 block">
              Top Scam Patterns Detected by AuraPay AI
            </span>

            {/* Pattern 1 */}
            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>1. Fake Refund / Reversal Scams</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                A scammer claims an accidental excess refund was issued or asks you to "pay ₹500 to unlock your ₹10,000 pending refund". Real refunds are credited automatically without customer action.
              </p>
            </div>

            {/* Pattern 2 */}
            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Gift className="w-4 h-4 shrink-0" />
                <span>2. Prize / Lottery Advance-Fee Scams</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                You are told you won a contest, lottery, or gift card, but must pay "processing fees", "GST", or "stamp duty" first. Legitimate rewards never demand upfront payments.
              </p>
            </div>

            {/* Pattern 3 */}
            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>3. Job Onboarding / Part-Time Task Scams</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Fraudulent recruiters offer high-paying work-from-home tasks (liking YouTube videos, reviewing hotels) and demand an upfront registration deposit or crypto recharge.
              </p>
            </div>

            {/* Pattern 4 */}
            <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Monitor className="w-4 h-4 shrink-0" />
                <span>4. Remote Screen Sharing Coercion</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Scammers ask victims to install apps like AnyDesk, TeamViewer, or RustDesk under the pretext of "technical support" or "KYC update" to spy on OTPs and PINs.
              </p>
            </div>
          </div>

          {/* Golden Checklist */}
          <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-600 space-y-2 text-xs">
            <span className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Safe Habits Every Time
            </span>
            <ul className="space-y-1 text-slate-200 pl-4 list-disc font-medium leading-relaxed">
              <li>Always send a test ₹1 transfer if paying a new contractor or seller.</li>
              <li>Hang up if someone is instructing you live on phone or messaging apps.</li>
              <li>Use the verified BBPS directory for all electricity, water, and gas bills.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end">
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition cursor-pointer shadow-md"
          >
            I Understand These Safeguards
          </button>
        </div>
      </div>
    </div>
  );
};
