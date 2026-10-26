import React from 'react';
import { BillDetails } from '../types/assistant';
import { ShieldCheck, Calendar, User, Hash, ArrowRight, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface BillReviewCardProps {
  bill: BillDetails;
  onProceedToAuth: () => void;
  onBack: () => void;
}

export const BillReviewCard: React.FC<BillReviewCardProps> = ({
  bill,
  onProceedToAuth,
  onBack,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div>
        {/* Top Navigation */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
          <button
            onClick={() => {
              sound.playTap();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Review Fetched Bill</h2>
            <p className="text-xs text-sky-300 font-medium">Step 3 of 4: Verify details</p>
          </div>
        </div>

        {/* Prototype Watermark Notice */}
        <div className="mt-3.5 px-3.5 py-2 rounded-xl bg-sky-950 border border-sky-700 flex items-center justify-between text-xs text-sky-200">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Simulated BBPS Fetch • Sandbox</span>
          </div>
          <span className="font-mono text-xs text-slate-300 font-bold">{bill.bbpsRefId}</span>
        </div>

        {/* Main Bill Card */}
        <div className="mt-3.5 rounded-2xl bg-slate-800 border-2 border-slate-700 p-4 shadow-xl space-y-4">
          {/* Header with Verified Biller */}
          <div className="flex items-start justify-between border-b border-slate-700 pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-300 font-bold">
                Verified Biller
              </span>
              <h3 className="text-base font-bold text-white mt-0.5 leading-snug">
                {bill.billerName}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>BBPS Verified</span>
            </div>
          </div>

          {/* Amount Display */}
          <div className="py-3 text-center bg-slate-900/90 rounded-2xl border-2 border-slate-700">
            <span className="text-xs text-slate-300 font-medium">Total Bill Amount Due</span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              ₹{bill.billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-600 text-amber-200 text-xs font-bold">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Due by {bill.dueDate} (in {bill.dueInDays} days)</span>
            </div>
          </div>

          {/* Consumer and Account Details Grid */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Hash className="w-4 h-4 text-sky-400" />
                <span>Consumer Number</span>
              </div>
              <span className="font-mono font-bold text-white">{bill.consumerNumber}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <User className="w-4 h-4 text-sky-400" />
                <span>Customer Name</span>
              </div>
              <span className="font-bold text-white">{bill.customerName}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Billing Period</span>
              </div>
              <span className="text-slate-200 font-medium">{bill.billPeriod}</span>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div className="border-t border-slate-700 pt-3 space-y-2 text-xs">
            <span className="text-sky-300 font-bold block">Bill Summary Breakdown</span>
            <div className="flex justify-between text-slate-200 font-medium">
              <span>Energy & Base Consumption ({bill.units || 'Standard'})</span>
              <span className="font-mono font-bold text-white">₹{bill.breakdown.baseCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-200 font-medium">
              <span>Fixed Regulatory Charges</span>
              <span className="font-mono font-bold text-white">₹{bill.breakdown.fixedCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-200 font-medium">
              <span>Taxes (GST & Surcharge)</span>
              <span className="font-mono font-bold text-white">₹{bill.breakdown.taxes.toFixed(2)}</span>
            </div>
            {bill.breakdown.earlyPaymentDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Early Payment Discount</span>
                <span className="font-mono">-₹{bill.breakdown.earlyPaymentDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-700 space-y-2.5">
        <button
          onClick={() => {
            sound.playTap();
            onProceedToAuth();
          }}
          className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/30"
        >
          <span>Proceed to Payment Authorization</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="w-full py-2 text-xs text-sky-300 hover:text-white font-medium transition text-center cursor-pointer"
        >
          Change consumer number or provider
        </button>
      </div>
    </div>
  );
};
