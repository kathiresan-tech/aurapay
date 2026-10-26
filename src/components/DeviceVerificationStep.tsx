import React, { useState, useEffect } from 'react';
import { Smartphone, ShieldCheck, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface DeviceVerificationStepProps {
  onVerificationComplete: () => void;
}

export const DeviceVerificationStep: React.FC<DeviceVerificationStepProps> = ({
  onVerificationComplete,
}) => {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep1Done(true);
      sound.playTap();
    }, 600);

    const t2 = setTimeout(() => {
      setStep2Done(true);
      sound.playTap();
    }, 1300);

    const t3 = setTimeout(() => {
      setStep3Done(true);
      setAllReady(true);
      sound.playSuccess();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-6 select-none overflow-y-auto">
      <div className="space-y-6 pt-4">
        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-sky-500/20 border-2 border-sky-500 text-sky-400">
            <Smartphone className="w-10 h-10 animate-pulse text-sky-300" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Simulating Device Verification
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-1.5 max-w-xs mx-auto">
              Simulating standard UPI device-binding & secure hardware token validation.
            </p>
          </div>
        </div>

        {/* Verification Check Steps */}
        <div className="space-y-3 max-w-sm mx-auto">
          {/* Check 1 */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
              step1Done
                ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-5 h-5 ${step1Done ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="text-xs sm:text-sm">
                <span className="font-bold block text-white">SIM & Hardware Binding</span>
                <span className="text-xs text-slate-300">Verified SIM slot 1 token (Simulated)</span>
              </div>
            </div>
            {step1Done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0"></span>
            )}
          </div>

          {/* Check 2 */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
              step2Done
                ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className={`w-5 h-5 ${step2Done ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="text-xs sm:text-sm">
                <span className="font-bold block text-white">Device Integrity & App Sandbox</span>
                <span className="text-xs text-slate-300">No screen recording or unauthorized hook</span>
              </div>
            </div>
            {step2Done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : step1Done ? (
              <span className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0"></span>
            )}
          </div>

          {/* Check 3 */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
              step3Done
                ? 'bg-slate-800 border-emerald-500 text-white shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-5 h-5 ${step3Done ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div className="text-xs sm:text-sm">
                <span className="font-bold block text-white">NPCI Sandbox Key Exchange</span>
                <span className="text-xs text-slate-300">Encrypted token issued</span>
              </div>
            </div>
            {step3Done ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : step2Done ? (
              <span className="w-3 h-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0"></span>
            )}
          </div>
        </div>

        {/* Prototype explanation */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 text-center max-w-sm mx-auto leading-relaxed">
          In production UPI applications, this step securely verifies phone number binding before handing off to the NPCI common library.
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-4 border-t border-slate-700">
        <button
          onClick={() => {
            sound.playTap();
            onVerificationComplete();
          }}
          disabled={!allReady}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            allReady
              ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Continue to Simulated UPI PIN Entry</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
