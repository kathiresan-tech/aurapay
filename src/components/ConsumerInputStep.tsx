import React, { useState } from 'react';
import { Biller, BillDetails, SampleConsumer } from '../types/assistant';
import { ShieldCheck, ArrowLeft, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface ConsumerInputStepProps {
  biller: Biller;
  onBillFetched: (bill: BillDetails) => void;
  onBack: () => void;
  initialConsumerNumber?: string;
}

export const ConsumerInputStep: React.FC<ConsumerInputStepProps> = ({
  biller,
  onBillFetched,
  onBack,
  initialConsumerNumber = '',
}) => {
  const [consumerNumber, setConsumerNumber] = useState(initialConsumerNumber);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchBill = (accountNo: string, sampleData?: SampleConsumer) => {
    if (!accountNo.trim()) {
      setError(`Please enter a valid ${biller.consumerLabel}`);
      return;
    }
    setError(null);
    setIsFetching(true);
    sound.playTap();

    setTimeout(() => {
      setIsFetching(false);
      sound.playSuccess();

      const matchedSample = sampleData || biller.sampleAccounts.find(
        (s) => s.consumerNumber === accountNo.trim()
      ) || biller.sampleAccounts[0];

      const billDetails: BillDetails = {
        billerId: biller.id,
        billerName: biller.name,
        category: biller.category,
        consumerNumber: accountNo.trim(),
        customerName: matchedSample ? matchedSample.customerName : 'R. K. Sharma',
        billAmount: matchedSample ? matchedSample.amount : 2480.00,
        dueDate: matchedSample ? matchedSample.dueDate : '2026-10-28',
        dueInDays: matchedSample ? matchedSample.dueInDays : 3,
        billPeriod: matchedSample ? matchedSample.billPeriod : '01 Sep 2026 - 30 Sep 2026',
        billDate: '2026-10-10',
        billNumber: `BILL-${Math.floor(100000 + Math.random() * 900000)}`,
        units: matchedSample ? matchedSample.units : '312 kWh',
        breakdown: matchedSample
          ? matchedSample.breakdown
          : {
              baseCharges: 2150.00,
              fixedCharges: 180.00,
              taxes: 185.00,
              earlyPaymentDiscount: 35.00,
            },
        bbpsRefId: `BBPS-REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
      };

      onBillFetched(billDetails);
    }, 1200);
  };

  const handleUseSampleAccount = (sample: SampleConsumer) => {
    setConsumerNumber(sample.consumerNumber);
    handleFetchBill(sample.consumerNumber, sample);
  };

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
            disabled={isFetching}
            className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white">Enter Account Details</h2>
            <p className="text-xs text-sky-300 font-medium">{biller.shortName}</p>
          </div>
        </div>

        {/* Verified Biller Header Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold text-white">{biller.name}</span>
              <p className="text-xs text-slate-300 font-medium mt-1">{biller.state} • BBPS Directory</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-sky-950 text-sky-300 border border-sky-600 font-bold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Verified Biller
            </span>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-2.5">
          <label className="block text-xs sm:text-sm font-bold text-slate-100">
            {biller.consumerLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={consumerNumber}
              onChange={(e) => {
                setConsumerNumber(e.target.value);
                if (error) setError(null);
              }}
              placeholder={biller.consumerPlaceholder}
              disabled={isFetching}
              className={`w-full bg-slate-800 border-2 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 font-mono font-semibold focus:outline-none transition ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : 'border-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20'
              }`}
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-bold">{error}</p>}

          <div className="flex items-center gap-2 text-xs text-slate-300 pt-1 font-medium">
            <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{biller.consumerHelpText}</span>
          </div>
        </div>

        {/* Demo Sample Accounts (Quick 1-Click Fill) */}
        {biller.sampleAccounts && biller.sampleAccounts.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-300">
                Demo Sample Accounts
              </span>
              <span className="text-xs text-white bg-sky-950 border border-sky-700 px-2 py-0.5 rounded font-semibold">1-click test fill</span>
            </div>

            <div className="space-y-2">
              {biller.sampleAccounts.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleUseSampleAccount(sample)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-sky-400 transition cursor-pointer flex items-center justify-between group shadow-sm"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                      {sample.label}
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5 font-mono">
                      <span>No: {sample.consumerNumber}</span>
                      <span>•</span>
                      <span className="text-sky-300 font-sans font-bold">₹{sample.amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <span className="text-xs text-white font-bold bg-sky-600 group-hover:bg-sky-500 px-3 py-1.5 rounded-lg transition shadow-sm">
                    Use
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="pt-4 border-t border-slate-700">
        <button
          onClick={() => handleFetchBill(consumerNumber)}
          disabled={isFetching || !consumerNumber.trim()}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            isFetching || !consumerNumber.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
          }`}
        >
          {isFetching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Fetching bill from {biller.shortName}...</span>
            </>
          ) : (
            <>
              <span>Fetch Simulated Bill</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
