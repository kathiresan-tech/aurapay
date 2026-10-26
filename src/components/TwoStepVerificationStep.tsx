import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Fingerprint,
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import { finishHighValuePasskeyFlow, getPasskeyStatus, passkeyAvailable, type CredentialKind } from '../utils/passkeyDemo';

interface TwoStepVerificationStepProps {
  amount: number;
  recipientOrBiller: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

export const TwoStepVerificationStep: React.FC<TwoStepVerificationStepProps> = ({
  amount,
  recipientOrBiller,
  onVerificationSuccess,
  onCancel,
}) => {
  const [subStep, setSubStep] = useState<'REVIEW_INTENT' | 'AUTHENTICATE'>('REVIEW_INTENT');
  const [hasAcknowledgedIntent, setHasAcknowledgedIntent] = useState(false);
  const [authenticatingKind, setAuthenticatingKind] = useState<CredentialKind | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [account, setAccount] = useState('AuraPay Demo Account');
  const [syncedPasskeyEnrolled, setSyncedPasskeyEnrolled] = useState(false);
  const [securityKeyEnrolled, setSecurityKeyEnrolled] = useState(false);
  const [passkeyServerReady, setPasskeyServerReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPasskeyStatus()
      .then((status) => { if (mounted) { setAccount(status.account); setSyncedPasskeyEnrolled(status.syncedPasskeyEnrolled); setSecurityKeyEnrolled(status.securityKeyEnrolled); setPasskeyServerReady(true); } })
      .catch((error: unknown) => {
        if (mounted) setAuthError(error instanceof Error ? error.message : 'Could not reach the local passkey server.');
      });
    return () => { mounted = false; };
  }, []);

  const authenticate = async (kind: CredentialKind) => {
    if (authenticatingKind) return;
    sound.playTap();
    setAuthenticatingKind(kind);
    setAuthError(null);
    try {
      await finishHighValuePasskeyFlow(amount, recipientOrBiller, kind);
      sound.playSuccess();
      onVerificationSuccess();
    } catch (error) {
      sound.playAlert();
      const errorName = error instanceof DOMException ? error.name : '';
      setAuthError(errorName === 'NotAllowedError'
        ? 'Passkey prompt was cancelled or not completed. The payment has not advanced.'
        : error instanceof Error ? error.message : 'Passkey verification failed. The payment has not advanced.');
      try {
        const status = await getPasskeyStatus();
        setSyncedPasskeyEnrolled(status.syncedPasskeyEnrolled);
        setSecurityKeyEnrolled(status.securityKeyEnrolled);
        setAccount(status.account);
        setPasskeyServerReady(true);
      } catch { /* Preserve the more useful original error. */ }
    } finally {
      setAuthenticatingKind(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
          <button onClick={() => { sound.playTap(); onCancel(); }} className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700" aria-label="Go back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">2-Step High-Value Verification</h2>
            <p className="text-xs text-amber-300 font-semibold">Extra check for payments over ₹10,000</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950 border-2 border-amber-500 text-amber-100 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wide"><ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" /><span>High-Value Security Check</span></div>
          <p className="text-xs text-amber-100 leading-relaxed font-medium">
            Review payment of <strong className="text-white text-sm">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> to <strong className="text-white">{recipientOrBiller}</strong>. After you confirm, your passkey provider will request fingerprint, face recognition, or device screen lock. AuraPay's local server checks the signed response and binds it to this exact amount and recipient.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className={`flex-1 p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold ${subStep === 'REVIEW_INTENT' ? 'bg-sky-950 border-sky-400 text-white' : 'bg-slate-800 border-emerald-500 text-emerald-300'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-bold">1</span><span>Intent Check</span>
          </div>
          <div className={`flex-1 p-2.5 rounded-xl border-2 flex items-center gap-2 text-xs font-bold ${subStep === 'AUTHENTICATE' ? 'bg-sky-950 border-sky-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-bold">2</span><span>Passkey or USB Key</span>
          </div>
        </div>

        {subStep === 'REVIEW_INTENT' ? (
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 space-y-3.5 shadow-md animate-in fade-in duration-150">
            <span className="text-xs uppercase font-extrabold tracking-wider text-sky-300 block">Step 1 of 2: Confirm payment intent</span>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs space-y-2 text-slate-200">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800"><span className="text-slate-400">Payment Amount</span><span className="text-lg font-bold text-white">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400">Recipient</span><span className="font-bold text-white">{recipientOrBiller}</span></div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5"><Lock className="w-4 h-4 text-sky-400" />Pause if someone is pressuring you</span>
              <p>Do not continue if a caller is directing this payment, asking for your PIN, or asking you to install a screen-sharing app.</p>
            </div>
            <label className="flex items-start gap-2.5 pt-2 text-xs font-bold text-white cursor-pointer">
              <input type="checkbox" checked={hasAcknowledgedIntent} onChange={(e) => setHasAcknowledgedIntent(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-500 text-sky-500 focus:ring-0" />
              <span>I intend to send this amount and have independently checked the recipient.</span>
            </label>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 space-y-4 shadow-md animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-sky-300">Step 2 of 2: Choose a secure key</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Intent confirmed</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-700">
              <KeyRound className="w-6 h-6 shrink-0 text-sky-300" />
              <div><strong className="block text-sm text-white">{account}</strong><small className="text-slate-400">{syncedPasskeyEnrolled ? 'Synced passkey ready' : securityKeyEnrolled ? 'FIDO2 security key ready' : 'Choose a credential to enroll'}</small></div>
            </div>
            <p className="text-xs text-slate-300">Choose a synced account passkey or a physical FIDO2/WebAuthn security key. A compatible USB or NFC key must be present. No code is typed into AuraPay: the browser/operating system opens the key PIN or touch prompt. Never enter your UPI PIN here. That is not your UPI PIN—never enter your UPI PIN in a browser prompt. AuraPay receives no biometric data.</p>
            <button type="button" onClick={() => authenticate('synced')} disabled={!!authenticatingKind || !passkeyAvailable() || !passkeyServerReady} className="w-full p-4 rounded-2xl border-2 border-sky-500 bg-sky-950/70 hover:bg-sky-900 disabled:opacity-70 text-left transition">
              <span className="flex items-center gap-3">
                {authenticatingKind === 'synced' ? <LoaderCircle className="w-8 h-8 text-sky-300 animate-spin" /> : <Fingerprint className="w-8 h-8 text-sky-300" />}
                <span><strong className="block text-sm text-white">{authenticatingKind === 'synced' ? 'Waiting for passkey…' : syncedPasskeyEnrolled ? 'Verify with synced passkey' : 'Create synced passkey'}</strong><small className="text-slate-300">Saved by your Google, Apple, or password-manager account</small></span>
              </span>
            </button>
            <button type="button" onClick={() => authenticate('security-key')} disabled={!!authenticatingKind || !passkeyAvailable() || !passkeyServerReady} className="w-full p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-950/40 hover:bg-emerald-900/50 disabled:opacity-70 text-left transition">
              <span className="flex items-center gap-3">
                {authenticatingKind === 'security-key' ? <LoaderCircle className="w-8 h-8 text-emerald-300 animate-spin" /> : <KeyRound className="w-8 h-8 text-emerald-300" />}
                <span><strong className="block text-sm text-white">{authenticatingKind === 'security-key' ? 'Waiting for security key…' : securityKeyEnrolled ? 'Verify with USB / NFC key' : 'Register USB / NFC security key'}</strong><small className="text-slate-300">Requires a FIDO2/WebAuthn hardware key; a regular flash drive will not work</small></span>
              </span>
            </button>
            {authError && <p role="alert" className="rounded-xl border border-rose-700 bg-rose-950/60 p-3 text-xs text-rose-200">{authError}</p>}
            <p className="text-[11px] leading-relaxed text-slate-400 bg-slate-950 rounded-xl p-3">The local server verifies the WebAuthn challenge and signature and binds it to this amount and recipient. USB security-key type is requested through the browser; this demo does not verify a hardware manufacturer. This is a demo account, not a bank identity, and no real payment is authorized.</p>
          </div>
        )}
      </div>

      {subStep === 'REVIEW_INTENT' && (
        <div className="pt-4 border-t border-slate-700 space-y-2">
          <button onClick={() => { sound.playTap(); setSubStep('AUTHENTICATE'); }} disabled={!hasAcknowledgedIntent} className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${!hasAcknowledgedIntent ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'}`}>
            <span>Continue to passkey verification</span><ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};








