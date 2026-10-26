import React, { useState } from 'react';
import { MerchantEntity } from '../types/assistant';
import { MOCK_MERCHANTS } from '../data/mockMerchants';
import {
  Store,
  ShieldCheck,
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface MerchantSelectStepProps {
  onSelectMerchant: (merchant: MerchantEntity, amount: number) => void;
  onCancel: () => void;
  defaultAmount?: number;
}

export const MerchantSelectStep: React.FC<MerchantSelectStepProps> = ({
  onSelectMerchant,
  onCancel,
  defaultAmount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantEntity | null>(null);
  const [amount, setAmount] = useState<number>(defaultAmount || 850);
  const [customUpi, setCustomUpi] = useState('');

  const filteredMerchants = MOCK_MERCHANTS.filter(
    (m) =>
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.upiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePickMerchant = (merchant: MerchantEntity) => {
    sound.playTap();
    setSelectedMerchant(merchant);
    if (!defaultAmount && merchant.defaultAmount) {
      setAmount(merchant.defaultAmount);
    }
  };

  const handleCustomMerchantVerify = () => {
    const upi = customUpi.trim();
    if (!upi) return;
    sound.playTap();

    // Only an exact match in the fictional demo directory gets a demo match badge.
    const demoMatch = MOCK_MERCHANTS.find(
      (merchant) => merchant.upiId.toLowerCase() === upi.toLowerCase()
    );
    if (demoMatch) {
      setSelectedMerchant(demoMatch);
      return;
    }

    const label = upi.split('@')[0] || 'Unknown recipient';
    const syntheticMerchant: MerchantEntity = {
      id: `custom-${Date.now()}`,
      businessName: 'Not found in demo directory',
      tradeName: label,
      upiId: upi,
      category: 'Unmatched sample profile',
      iconName: 'Store',
      defaultAmount: amount || 500,
      verification: {
        isVerifiedMerchant: false,
        businessName: label,
        tradeName: label,
        category: 'Not available from this prototype',
        isGstRegistered: false,
        mccCode: 'Not checked',
        disputeRisk: 'MEDIUM',
        physicalAddress: 'Not available',
        verifiedBadgeText: 'Not matched in demo directory',
        explanation: 'This UPI ID has no exact match in the fictional demo directory. That does not prove the payee is fraudulent. Verify the business through a trusted official source before paying.',
        warningFlags: ['No demo directory match; no live merchant check was performed.'],
      },
    };

    setSelectedMerchant(syntheticMerchant);
  };
  const handleProceed = () => {
    if (!selectedMerchant) return;
    sound.playTap();
    onSelectMerchant(selectedMerchant, amount);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-white p-4 select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Top Navigation */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
          <button
            onClick={() => {
              sound.playTap();
              onCancel();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Pay to Merchant</h2>
            <p className="text-xs text-sky-300 font-medium">Sample merchant directory check</p>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="p-3.5 rounded-2xl bg-sky-950 border-2 border-sky-600/70 text-sky-100 shadow-md">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-sky-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Demo merchant directory
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            This screen compares the entered UPI ID with fictional sample profiles. It does not check live GSTIN, MCC, bank, or business records.
          </p>
        </div>

        {/* Enter Custom Merchant UPI */}
        <div className="p-3 rounded-2xl bg-slate-800/90 border-2 border-slate-700 space-y-2">
          <label className="text-xs font-bold text-slate-200 block">
            Enter Merchant UPI ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUpi}
              onChange={(e) => setCustomUpi(e.target.value)}
              placeholder="Enter a sample merchant UPI ID"
              className="flex-1 bg-slate-900 border-2 border-slate-600 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 font-mono"
            />
            <button
              type="button"
              onClick={handleCustomMerchantVerify}
              disabled={!customUpi.trim()}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-bold text-xs transition cursor-pointer shrink-0"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Merchant Directory List */}
        <div className="space-y-2.5">
          <span className="text-xs uppercase tracking-wider font-bold text-sky-300 px-1 block">
            Sample merchant profiles ({filteredMerchants.length})
          </span>

          {filteredMerchants.map((merchant) => {
            const isSelected = selectedMerchant?.id === merchant.id;
            const isVerified = merchant.verification.isVerifiedMerchant;

            return (
              <div
                key={merchant.id}
                onClick={() => handlePickMerchant(merchant)}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer space-y-2.5 shadow-sm ${
                  isSelected
                    ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/30'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0 border ${
                        isVerified
                          ? 'bg-sky-950 border-sky-600 text-sky-300'
                          : 'bg-rose-950 border-rose-600 text-rose-300'
                      }`}
                    >
                      <Store className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white">{merchant.tradeName}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{merchant.businessName}</p>
                      <p className="font-mono text-xs text-sky-300 font-bold mt-0.5">{merchant.upiId}</p>
                    </div>
                  </div>

                  {/* Verification Pill */}
                  <div className="shrink-0 flex flex-col items-end">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Demo directory match</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500 shadow-sm">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>Demo risk flag</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Report Card */}
                <div
                  className={`p-3 rounded-xl text-xs space-y-1.5 border ${
                    isVerified
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-100'
                      : 'bg-rose-950/50 border-rose-800/70 text-rose-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4" />
                      <span>{merchant.verification.category}</span>
                    </span>
                    {merchant.verification.gstin ? (
                      <span className="font-mono text-[11px] text-sky-300">
                        Demo GST field: {merchant.verification.gstin}
                      </span>
                    ) : (
                      <span className="text-rose-300 font-bold">GSTIN NOT CHECKED</span>
                    )}
                  </div>

                  <p className="leading-relaxed font-medium">{merchant.verification.explanation}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 pt-1 border-t border-slate-700/50">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{merchant.verification.physicalAddress}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Merchant Amount Card */}
        {selectedMerchant && (
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-sky-500/80 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-300">
                Payment Amount for {selectedMerchant.tradeName}
              </span>
              {amount > 10000 && (
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500 px-2 py-0.5 rounded-full font-bold">
                  2-Step Auth Required (&gt;₹10k)
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-bold text-slate-300">₹</span>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter amount..."
                className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl pl-9 pr-3 py-2 text-base font-bold text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* Quick Amount Suggestion Buttons */}
            <div className="flex gap-2 text-xs">
              {[250, 850, 4500, 14500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setAmount(amt);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    amount === amt
                      ? 'bg-sky-600 border-sky-400 text-white'
                      : 'bg-slate-700/80 border-slate-600 text-slate-200 hover:text-white'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')} {amt > 10000 && '🛡️'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4 border-t border-slate-700">
        <button
          onClick={handleProceed}
          disabled={!selectedMerchant || !amount || amount <= 0}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            !selectedMerchant || !amount || amount <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
          }`}
        >
          <span>Continue to Payment Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};



