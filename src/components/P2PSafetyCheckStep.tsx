import React, { useState } from 'react';
import { P2PRecipient, PaymentPurpose, FirstPaymentSafetyCheck } from '../types/assistant';
import { evaluateSafetyCheck } from '../data/mockRecipients';
import {
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  XCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface P2PSafetyCheckStepProps {
  recipient: P2PRecipient;
  amount: number;
  rawUserPrompt: string;
  onProceedToReview: (check: FirstPaymentSafetyCheck) => void;
  onCancelPayment: () => void;
}

export const P2PSafetyCheckStep: React.FC<P2PSafetyCheckStepProps> = ({
  recipient,
  amount,
  rawUserPrompt,
  onProceedToReview,
  onCancelPayment,
}) => {
  const initialPurpose: PaymentPurpose | null = (() => {
    const text = rawUserPrompt.toLowerCase();
    if (text.includes('prize') || text.includes('lottery') || text.includes('won')) return 'prize_lottery';
    if (text.includes('refund') || text.includes('reversal')) return 'refund_deposit';
    if (text.includes('job') || text.includes('task') || text.includes('registration')) return 'job_registration';
    if (text.includes('market') || text.includes('olx')) return 'online_marketplace';
    if (text.includes('friend') || text.includes('family') || text.includes('priya') || text.includes('rahul')) return 'family_friends';
    return null;
  })();

  const [purpose, setPurpose] = useState<PaymentPurpose | null>(initialPurpose);
  const [isPressured, setIsPressured] = useState<boolean | null>(null);
  const [hasAcknowledgedRisk, setHasAcknowledgedRisk] = useState(false);

  const safetyEvaluation = purpose !== null && isPressured !== null
    ? evaluateSafetyCheck(purpose, isPressured, recipient.resolvedName, rawUserPrompt)
    : null;

  const isScamHighRisk = Boolean(
    safetyEvaluation &&
      (safetyEvaluation.scamRiskScore === 'CRITICAL' ||
        safetyEvaluation.scamRiskScore === 'HIGH')
  );

  const handleContinue = () => {
    if (!safetyEvaluation) return;
    sound.playTap();
    onProceedToReview({
      ...safetyEvaluation,
      acknowledgedWarning: hasAcknowledgedRisk || !isScamHighRisk,
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
          <button
            onClick={() => {
              sound.playTap();
              onCancelPayment();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">First-Payment Safety Check</h2>
            <p className="text-xs text-sky-300 font-medium">Step 2 of 4: Recipient verification</p>
          </div>
        </div>

        {/* Bank-Resolved Recipient Card with STRICT "Account name matched" labeling */}
        <div className="rounded-2xl bg-slate-800 border-2 border-slate-700 p-4 shadow-lg space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-300">
                Simulated Banking Lookup
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1 tracking-tight">
                {recipient.resolvedName}
              </h3>
              <p className="font-mono text-xs text-sky-300 font-bold mt-0.5">{recipient.upiId}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">{recipient.bankName}</p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-200 border-2 border-sky-500 shadow-sm">
                Account Name Matched
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-950 text-amber-200 border border-amber-600">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Not verified safe</span>
              </span>
            </div>
          </div>

          {/* Explanation Callout Required by Prompt */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs leading-relaxed text-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Why this is not marked “Verified Safe”</span>
            </div>
            <p>
              A name match only confirms the account details returned by the demo banking lookup. It <strong className="text-white">does not prove the person or request is trustworthy</strong>. Fraudsters frequently create accounts under real names to collect irreversible UPI transfers.
            </p>
          </div>
        </div>

        {/* Amount Confirmation Pill */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800 border-2 border-slate-700 text-xs sm:text-sm">
          <span className="text-slate-300 font-medium">Transfer Amount</span>
          <span className="text-lg font-bold text-white">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Safety Questionnaire */}
        <div className="space-y-4 pt-1">
          {/* Question 1: What is this payment for? */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>1. What is this payment for?</span>
            </label>

            <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
              {[
                { id: 'family_friends', label: '👤 Friend or Family Member', risk: 'low' },
                { id: 'goods_services', label: '🛍️ Goods or Services received locally', risk: 'low' },
                { id: 'online_marketplace', label: '📦 Marketplace item (OLX, Classifieds)', risk: 'medium' },
                { id: 'job_registration', label: '💼 Work-from-home or Job onboarding fee', risk: 'high' },
                { id: 'prize_lottery', label: '🎁 Processing fee to claim a prize/lottery', risk: 'high' },
                { id: 'refund_deposit', label: '🔄 Deposit to receive a refund or unlock funds', risk: 'high' },
                { id: 'other', label: '❓ Other personal expense', risk: 'low' },
              ].map((opt) => {
                const isSelected = purpose === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      sound.playTap();
                      setPurpose(opt.id as PaymentPurpose);
                    }}
                    className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex items-center justify-between font-medium ${
                      isSelected
                        ? opt.risk === 'high'
                          ? 'bg-rose-950 border-rose-500 text-white font-bold'
                          : 'bg-sky-950 border-sky-400 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Is anyone pressuring or instructing you? */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>2. Is anyone pressuring or instructing you over phone/chat right now?</span>
            </label>

            <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
              <button
                onClick={() => {
                  sound.playTap();
                  setIsPressured(false);
                }}
                className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex items-center justify-between font-medium ${
                  isPressured === false
                    ? 'bg-emerald-950 border-emerald-400 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                }`}
              >
                <span>🛡️ No, this is entirely my own informed decision</span>
                {isPressured === false && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>}
              </button>

              <button
                onClick={() => {
                  sound.playAlert();
                  setIsPressured(true);
                }}
                className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex items-center justify-between font-medium ${
                  isPressured === true
                    ? 'bg-rose-950 border-rose-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                }`}
              >
                <span>🚨 Yes, someone on a call/chat is telling me to pay or share screen</span>
                {isPressured === true && <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>}
              </button>
            </div>
          </div>

          {/* High Risk Scam Warning Banner */}
          {isScamHighRisk && safetyEvaluation && (
            <div className="p-4 rounded-2xl bg-rose-950 border-2 border-rose-500 text-white shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-300 font-extrabold text-xs uppercase tracking-wide">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Urgent Scam Pattern Warning</span>
              </div>

              {safetyEvaluation.warnings.map((warn, i) => (
                <p key={i} className="text-xs sm:text-sm leading-relaxed text-rose-100 font-semibold">
                  {warn}
                </p>
              ))}

              <div className="p-3 rounded-xl bg-slate-900 border border-rose-800 text-xs text-slate-200 space-y-1">
                <span className="font-bold text-rose-400">Remember NPCI Golden Rule:</span>
                <p>
                  You <strong className="text-white">never enter your UPI PIN or pay money to receive money</strong>. Any request asking you to pay to get a prize, salary, or refund is 100% fraudulent.
                </p>
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-rose-200 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAcknowledgedRisk}
                  onChange={(e) => setHasAcknowledgedRisk(e.target.checked)}
                  className="mt-0.5 rounded border-rose-400 text-rose-600 focus:ring-0 w-4 h-4"
                />
                <span>I understand this looks like a scam and wish to continue testing in this demo sandbox only.</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-700 space-y-2.5">
        {isScamHighRisk && (
          <button
            onClick={() => {
              sound.playTap();
              onCancelPayment();
            }}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-950/60"
          >
            <XCircle className="w-5 h-5" />
            <span>Cancel Transfer (Recommended for Safety)</span>
          </button>
        )}

        <button
          onClick={handleContinue}
          disabled={!safetyEvaluation || (isScamHighRisk && !hasAcknowledgedRisk)}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            !safetyEvaluation || (isScamHighRisk && !hasAcknowledgedRisk)
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : isScamHighRisk
              ? 'bg-slate-800 hover:bg-slate-750 text-rose-300 border-2 border-rose-500'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30'
          }`}
        >
          <span>Continue to Final Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
