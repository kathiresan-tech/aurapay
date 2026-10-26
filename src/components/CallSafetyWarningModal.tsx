import React from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

interface CallSafetyWarningModalProps {
  callIsActive: boolean;
  minutesRemaining?: number;
  onCancelPayment: () => void;
  onContinue: () => void;
}

export const CallSafetyWarningModal: React.FC<CallSafetyWarningModalProps> = ({
  callIsActive,
  minutesRemaining,
  onCancelPayment,
  onContinue,
}) => (
  <div className="fixed inset-0 z-[80] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4" role="presentation">
    <section role="alertdialog" aria-modal="true" aria-labelledby="call-warning-title" aria-describedby="call-warning-description" className="w-full max-w-md rounded-3xl border-2 border-amber-400 bg-slate-900 p-5 sm:p-6 text-white shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-amber-400/50 bg-amber-950 p-3"><AlertTriangle className="h-7 w-7 text-amber-300" /></div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300">Payment safety pause</p>
            <h2 id="call-warning-title" className="mt-1 text-xl font-extrabold">{callIsActive ? 'You are on a call' : 'You recently ended a call'}</h2>
          </div>
        </div>
        <button type="button" onClick={onCancelPayment} aria-label="Cancel payment" className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
      </div>

      <p id="call-warning-description" className="text-sm leading-relaxed text-slate-200">
        {callIsActive
          ? 'Someone on the call may be pressuring or guiding you to send money. Pause and independently verify the caller and the payment request.'
          : `A call ended recently${minutesRemaining ? `, within the 10-minute safety window` : ''}. Scammers may stay on the line or pressure you to pay immediately. Verify the caller and payment request independently.`}
      </p>

      <div className="mt-4 rounded-2xl border border-amber-700/70 bg-amber-950/60 p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-extrabold text-amber-200"><PhoneCall className="h-4 w-4" />Before continuing</p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-amber-100">
          <li>Verify the caller and fund request using a trusted contact method.</li>
          <li>Never share your UPI PIN or OTP with the caller.</li>
          <li>If you suspect fraud, call <a className="font-bold underline decoration-amber-300 underline-offset-2" href="tel:1930">1930</a> or visit <a className="font-bold underline decoration-amber-300 underline-offset-2" href="https://www.cybercrime.gov.in/" target="_blank" rel="noreferrer">cybercrime.gov.in</a>.</li>
        </ul>
      </div>

      <p className="mt-3 text-xs text-slate-400">This is an advisory only. AuraPay will not block the payment if you choose to continue.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancelPayment} className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700">Cancel payment</button>
        <button type="button" onClick={onContinue} className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-300">Continue anyway</button>
      </div>
    </section>
  </div>
);
