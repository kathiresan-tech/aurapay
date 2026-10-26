import React, { useState } from 'react';
import { BillDetails, P2PRecipient, FirstPaymentSafetyCheck } from '../types/assistant';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Lock,
  ChevronDown,
  Info,
  CheckCircle2,
  Store,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { sound } from '../utils/audioEffects';
import type { PaymentStepUpCheck } from '../utils/paymentStepUp';

interface PreAuthReviewScreenProps {
  type: 'BILL' | 'P2P' | 'MERCHANT';
  billDetails?: BillDetails;
  p2pRecipient?: P2PRecipient;
  amount: number;
  safetyCheck?: FirstPaymentSafetyCheck;
  stepUpCheck: PaymentStepUpCheck;
  onProceedToNext: () => void;
  onBack: () => void;
}

export const PreAuthReviewScreen: React.FC<PreAuthReviewScreenProps> = ({
  type,
  billDetails,
  p2pRecipient,
  amount,
  safetyCheck,
  stepUpCheck,
  onProceedToNext,
  onBack,
}) => {
  const isBill = type === 'BILL' && billDetails;
  const isMerchant = p2pRecipient?.isMerchant;
  const isFriend = p2pRecipient?.isFriendContact;
  const isHighValue = amount >= 10000;
  const needsTwoStep = isHighValue || stepUpCheck.requiresTwoStep;

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div className="space-y-4">
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
            <h2 className="text-base font-bold text-white">Pre-Authorization Review</h2>
            <p className="text-xs text-sky-300 font-medium">Verify recipient & verification status</p>
          </div>
        </div>

        {/* Prototype Banner */}
        <div className="p-3 rounded-xl bg-sky-950 border border-sky-600 flex items-center justify-between text-xs text-sky-200 shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <Lock className="w-4 h-4 text-sky-400" />
            <span>Simulated Payment Gateway</span>
          </div>
          <span className="bg-sky-600 text-white px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase">
            PROTOTYPE
          </span>
        </div>

        {/* High-Value Notice If > ₹10,000 */}
        {needsTwoStep && (
          <div className="p-3 rounded-xl bg-amber-950 border-2 border-amber-500 text-amber-100 flex items-center justify-between text-xs font-bold shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Extra Verification Required: high value or recent split-payment pattern</span>
            </div>
            <span className="text-xs bg-amber-900 border border-amber-600 px-2 py-0.5 rounded text-amber-200 font-mono">
              ≥₹10,000 / 20h
            </span>
          </div>
        )}

        {stepUpCheck.requiresTwoStep && (
          <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-600 text-xs text-amber-100 space-y-1.5">
            <strong className="text-amber-300">Why the extra check is required</strong>
            {stepUpCheck.reasons.map((reason) => <p key={reason}>{reason}</p>)}
            <p className="text-amber-200/80">This demo counts completed transfers to this same recipient in the rolling 20 hours, then includes this attempted payment.</p>
          </div>
        )}

        {/* Target Entity Card */}
        <div className="rounded-2xl bg-slate-800 border-2 border-slate-700 p-4 shadow-xl space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-xs uppercase font-bold tracking-wider text-sky-300">
                {isBill
                  ? 'Verified Utility Biller'
                  : isMerchant
                  ? 'Merchant Entity'
                  : isFriend
                  ? 'Friend Contact'
                  : 'New Recipient Account'}
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {isBill ? billDetails.billerName : p2pRecipient?.resolvedName}
              </h3>
              <p className="font-mono text-xs text-sky-300 font-bold">
                {isBill ? `Consumer ID: ${billDetails.consumerNumber}` : p2pRecipient?.upiId}
              </p>
            </div>

            {/* Verification Status Pill */}
            {isBill ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                BBPS Verified
              </span>
            ) : isMerchant ? (
              p2pRecipient?.merchantVerification?.isVerifiedMerchant ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Demo directory match
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Not matched in demo directory
                </span>
              )
            ) : isFriend ? (
              p2pRecipient?.friendVerification?.isVerifiedUser ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Demo profile match
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Demo risk flag
                </span>
              )
            ) : (
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-950 text-sky-200 border border-sky-500">
                  Simulated name match
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  Not a safety verification
                </span>
              </div>
            )}
          </div>

          {/* Verification Details Box */}
          {isMerchant && p2pRecipient?.merchantVerification && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">{p2pRecipient.merchantVerification.category}</span>
                {p2pRecipient.merchantVerification.gstin && (
                  <span className="font-mono text-sky-300 text-[11px]">
                    Demo GSTIN field: {p2pRecipient.merchantVerification.gstin}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">{p2pRecipient.merchantVerification.explanation}</p>
            </div>
          )}

          {isFriend && p2pRecipient?.friendVerification && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 space-y-1">
              <span className="font-bold text-sky-300 block">
                {p2pRecipient.friendVerification.statusBadge}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {p2pRecipient.friendVerification.explanation}
              </p>
            </div>
          )}

          {/* If Bill: Consumer Name & Due Date */}
          {isBill && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs sm:text-sm">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-300 block font-medium">Registered Name</span>
                <span className="font-bold text-white truncate block mt-0.5">
                  {billDetails.customerName}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-300 block font-medium">Due Date</span>
                <span className="font-bold text-amber-300 block mt-0.5">
                  {billDetails.dueDate} ({billDetails.dueInDays}d left)
                </span>
              </div>
            </div>
          )}

          {/* Safety Check Notice */}
          {!isBill && safetyCheck && safetyCheck.scamRiskScore !== 'LOW' && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-xs text-rose-100">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Safety Check Note</span>
              </div>
              <p className="mt-1 text-rose-100 font-medium leading-relaxed">
                You marked this payment purpose as{' '}
                <strong className="capitalize text-white">{safetyCheck.purpose?.replace(/_/g, ' ')}</strong>. You have acknowledged the inherent scam risk for testing purposes.
              </p>
            </div>
          )}
        </div>

        {/* Amount Card */}
        <div className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-200 font-medium">Total Payable Amount</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-xs text-slate-300 pt-2 border-t border-slate-700 flex justify-between font-medium">
            <span>Convenience Fee & Taxes</span>
            <span className="text-emerald-400 font-bold">₹0.00 (Free in Demo)</span>
          </div>
        </div>

        {/* Debit Account Selection (Simulated) */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-slate-100 block">
            Pay Using (Simulated Bank Account)
          </label>

          <div className="p-3.5 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-600 flex items-center justify-center text-sky-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white block">Demo HDFC Bank</span>
                <span className="text-xs text-slate-300 block font-mono font-medium">
                  Account •••• 4092 (Simulated Bal: ₹45,200)
                </span>
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-slate-700 space-y-2.5">
        <button
          onClick={() => {
            sound.playTap();
            onProceedToNext();
          }}
          className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-sky-500/30"
        >
          <Lock className="w-4 h-4" />
          <span>
            {needsTwoStep ? 'Proceed to 2-Step Verification' : 'Authorize & Proceed to Device Check'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="w-full py-2 text-xs text-sky-300 hover:text-white font-medium transition text-center cursor-pointer"
        >
          Cancel and modify details
        </button>
      </div>
    </div>
  );
};






