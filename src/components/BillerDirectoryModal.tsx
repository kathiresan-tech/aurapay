import React, { useState } from 'react';
import { Biller, BillerCategory } from '../types/assistant';
import { DEMO_VERIFIED_BILLERS } from '../data/mockBillers';
import {
  ShieldCheck,
  X,
  Search,
  Zap,
  Droplet,
  Flame,
  Wifi,
  ArrowRight,
  Info
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface BillerDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBillerToPay: (biller: Biller) => void;
}

export const BillerDirectoryModal: React.FC<BillerDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectBillerToPay,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredBillers = DEMO_VERIFIED_BILLERS.filter((biller) => {
    const matchesCat = filterCategory === 'all' || biller.category === filterCategory;
    const matchesSearch =
      biller.name.toLowerCase().includes(query.toLowerCase()) ||
      biller.shortName.toLowerCase().includes(query.toLowerCase()) ||
      biller.state.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: BillerCategory) => {
    switch (category) {
      case 'electricity':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'water':
        return <Droplet className="w-5 h-5 text-sky-400" />;
      case 'gas':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'broadband':
        return <Wifi className="w-5 h-5 text-indigo-400" />;
      default:
        return <Zap className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-sky-500 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-600 text-sky-300">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Demo Verified Biller Directory
              </h3>
              <p className="text-xs text-sky-300 font-semibold">
                Official Bharat BillPay (BBPS) Simulated Sandbox
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

        {/* Informational Callout */}
        <div className="px-4 py-2.5 bg-sky-950 border-b border-sky-800 flex items-start gap-2 text-xs text-sky-100 font-medium">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            This directory guarantees that bill payments are routed only to pre-registered, genuine utility operators with verified regulatory licenses.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="p-4 space-y-3 border-b border-slate-700 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by biller name, state, or utility..."
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'electricity', 'water', 'gas', 'broadband'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playTap();
                  setFilterCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition cursor-pointer border ${
                  filterCategory === cat
                    ? 'bg-sky-500 border-sky-400 text-white shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredBillers.map((biller) => (
            <div
              key={biller.id}
              className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-sky-400 transition flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(biller.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-white">{biller.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 font-medium">
                      <span>{biller.state}</span>
                      <span>•</span>
                      <span className="font-mono text-xs text-sky-300 font-bold">{biller.bbpsId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-700 text-xs">
                <span className="text-slate-300 truncate max-w-[220px] font-medium">
                  Requires: {biller.consumerLabel}
                </span>

                <button
                  onClick={() => {
                    sound.playTap();
                    onSelectBillerToPay(biller);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <span>Pay Bill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-900 text-center text-xs text-slate-300 font-medium">
          Showing {filteredBillers.length} verified demo providers. All accounts and charges are mock simulations.
        </div>
      </div>
    </div>
  );
};
