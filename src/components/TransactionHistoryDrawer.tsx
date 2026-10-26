import React from 'react';
import { TransactionRecord } from '../types/assistant';
import {
  X,
  History,
  ShieldCheck,
  Zap,
  UserCheck,
  Calendar,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface TransactionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionRecord[];
  onSelectReceipt: (tx: TransactionRecord) => void;
}

export const TransactionHistoryDrawer: React.FC<TransactionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l-2 border-slate-700 w-full max-w-md h-full flex flex-col text-white shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-sky-400 border border-slate-700">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Simulated Transaction History
              </h3>
              <p className="text-xs text-sky-300 font-semibold">
                Mock sandbox records ({transactions.length})
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

        {/* Prototype notice */}
        <div className="px-4 py-2.5 bg-amber-950 border-b border-amber-800 text-xs text-amber-200 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>All transactions shown here are simulated logs. Zero real funds moved.</span>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Receipt className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No simulated transactions yet.</p>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Try typing “Pay my electricity bill” or “Send ₹500 to rahul@okhdfcbank” on the home screen.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  sound.playTap();
                  onSelectReceipt(tx);
                }}
                className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-sky-400 transition cursor-pointer flex items-start justify-between group shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-sky-400">
                    {tx.type === 'BILL' ? (
                      <Zap className="w-5 h-5 text-sky-400" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition">
                        {tx.billerOrRecipient}
                      </span>
                      {tx.type === 'BILL' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          BBPS Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-200 border border-sky-500 font-bold">
                          Account Matched
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-sky-300 font-medium">{tx.accountReference}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">UTR: {tx.utrNumber.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-extrabold text-white block">
                    ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Completed</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-between items-center text-xs text-slate-300 font-medium">
          <span>AuraPay Prototype Sandbox</span>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-sky-400 hover:text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
