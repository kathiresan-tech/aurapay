import React, { useState } from 'react';
import { ShieldCheck, Info, X, AlertTriangle } from 'lucide-react';

export const PrototypeBanner: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="bg-sky-950 text-white px-3 py-2 text-xs flex items-center justify-between border-b-2 border-sky-500/60 z-40 select-none shadow-md">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-300"></span>
          </span>
          <span className="bg-sky-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shadow-sm">
            Prototype Only
          </span>
          <span className="truncate text-slate-100 font-medium">
            Simulated Sandbox • No real payments sent
          </span>
        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="ml-2 flex items-center gap-1.5 text-sky-200 hover:text-white bg-sky-900 hover:bg-sky-800 border border-sky-600/60 px-2.5 py-1 rounded-lg transition text-xs font-semibold shrink-0 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-sky-300" />
          <span>Safety Notice</span>
        </button>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-sky-400 mb-4">
              <div className="p-2.5 bg-sky-500/20 border border-sky-500/40 rounded-xl">
                <ShieldCheck className="w-7 h-7 text-sky-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Prototype Safeguards Notice</h3>
                <p className="text-xs text-sky-300 font-medium">Simulated AI Payment Sandbox</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200 leading-relaxed">
              <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-amber-100">
                  <strong className="text-amber-300">No Real Money:</strong> This application is strictly an interactive prototype. It is completely disconnected from real banking networks and UPI servers.
                </p>
              </div>

              <div className="space-y-2.5 border-t border-slate-700 pt-3">
                <p className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong className="text-white">Never enter your real UPI PIN:</strong> The prototype includes a simulated MPIN keypad. Never type your real banking PIN here or on any untrusted interface.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong className="text-white">Verified Biller Directory:</strong> Utility bill payments only fetch providers from a pre-vetted, verified directory (BBPS simulated).</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong className="text-white">Account Name Matched ≠ Verified Safe:</strong> Bank name resolution only confirms an account exists; it does not prove the person is genuine or safe.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span><strong className="text-white">Scam Warnings:</strong> First-time transfers include safety checks for common scam patterns (fake refunds, advance-fee prize claims, and job onboarding fees).</span>
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 rounded-xl transition text-sm cursor-pointer shadow-lg shadow-sky-500/30"
              >
                Understood, Return to Prototype
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
