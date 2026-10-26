import React from 'react';

interface OtpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OtpSettingsModal: React.FC<OtpSettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="demo-otp-title" className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl">
        <h2 id="demo-otp-title" className="text-lg font-bold">Demo verification only</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">AuraPay does not send SMS messages or connect to a bank. The high-value flow uses the sample code <strong className="text-sky-300">849201</strong> for demonstration.</p>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white">Close</button>
      </section>
    </div>
  );
};
