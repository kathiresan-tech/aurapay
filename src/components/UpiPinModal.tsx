import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Delete, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface UpiPinModalProps {
  amount: number;
  recipientOrBiller: string;
  onPinSuccess: () => void;
  onCancel: () => void;
}

export const UpiPinModal: React.FC<UpiPinModalProps> = ({
  amount,
  recipientOrBiller,
  onPinSuccess,
  onCancel,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pinDigits.length < 4 && !isAuthorizing) {
      sound.playTap();
      const newDigits = [...pinDigits, num];
      setPinDigits(newDigits);
      if (newDigits.length === 4) {
        submitSimulatedPin();
      }
    }
  };

  const handleDelete = () => {
    if (pinDigits.length > 0 && !isAuthorizing) {
      sound.playTap();
      setPinDigits(pinDigits.slice(0, -1));
    }
  };

  const handleAutoFillDemoPin = () => {
    if (isAuthorizing) return;
    sound.playTap();
    setPinDigits(['1', '2', '3', '4']);
    submitSimulatedPin();
  };

  const submitSimulatedPin = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      sound.playSuccess();
      setIsAuthorizing(false);
      onPinSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 select-none">
      <div className="bg-slate-900 border-t-2 sm:border-2 border-slate-700 rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 text-white shadow-2xl space-y-4">
        {/* Top Disclaimer Warning Banner */}
        <div className="p-3 rounded-2xl bg-amber-950 border-2 border-amber-500 text-amber-100 text-center space-y-1 shadow-md">
          <div className="flex items-center justify-center gap-2 font-extrabold text-xs uppercase tracking-wider text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Simulated UPI Screen — Do Not Enter Real PIN</span>
          </div>
          <p className="text-xs text-amber-200 font-medium leading-relaxed">
            This is a mock prototype interface. <strong className="text-white">Never enter your real bank PIN here.</strong>
          </p>
        </div>

        {/* Payment Summary */}
        <div className="text-center pt-1">
          <span className="text-xs text-slate-300 font-medium">Paying simulated amount</span>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-sky-300 font-bold truncate max-w-xs mx-auto mt-1">
            To: {recipientOrBiller}
          </p>
        </div>

        {/* PIN Dots (Masked) */}
        <div className="py-2 flex justify-center items-center gap-4">
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pinDigits.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  hasDigit
                    ? 'bg-sky-400 border-sky-400 scale-125 shadow-md shadow-sky-400/60'
                    : 'border-slate-500 bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {/* Quick Demo Fill Button */}
        <div className="flex justify-center">
          <button
            onClick={handleAutoFillDemoPin}
            disabled={isAuthorizing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-sky-600 text-white border border-sky-400 hover:bg-sky-500 transition cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            <span>Tap to Auto-fill Demo PIN (1234)</span>
          </button>
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              disabled={isAuthorizing}
              className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xl transition active:scale-95 cursor-pointer border-2 border-slate-700 shadow-sm"
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => {
              sound.playTap();
              onCancel();
            }}
            disabled={isAuthorizing}
            className="py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 border-2 border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            disabled={isAuthorizing}
            className="py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xl transition active:scale-95 cursor-pointer border-2 border-slate-700 shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            disabled={isAuthorizing}
            className="py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-200 transition active:scale-95 cursor-pointer flex items-center justify-center border-2 border-slate-700"
          >
            <Delete className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {/* Processing State Overlay */}
        {isAuthorizing && (
          <div className="flex items-center justify-center gap-2 text-xs text-sky-300 font-bold py-2">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            <span>Simulating secure bank authorization...</span>
          </div>
        )}

        {/* Bottom NPCI / BHIM simulated badge */}
        <div className="pt-2 border-t border-slate-700 text-center flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Simulated NPCI Sandbox Mock • Zero Real Money Transferred</span>
        </div>
      </div>
    </div>
  );
};
