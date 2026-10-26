import React, { useState } from 'react';
import { Biller, BillerCategory } from '../types/assistant';
import { DEMO_VERIFIED_BILLERS } from '../data/mockBillers';
import { ShieldCheck, Search, Zap, Droplet, Flame, Wifi, ChevronRight, ArrowLeft } from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface BillerSelectStepProps {
  initialCategory?: BillerCategory;
  onSelectBiller: (biller: Biller) => void;
  onCancel: () => void;
  userPromptText: string;
}

export const BillerSelectStep: React.FC<BillerSelectStepProps> = ({
  initialCategory = 'electricity',
  onSelectBiller,
  onCancel,
  userPromptText,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BillerCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBillers = DEMO_VERIFIED_BILLERS.filter((biller) => {
    const matchesCategory = biller.category === selectedCategory;
    const matchesSearch =
      biller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biller.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biller.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    <div className="flex-1 flex flex-col bg-slate-900 text-white p-4 select-none overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
        <button
          onClick={() => {
            sound.playTap();
            onCancel();
          }}
          className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white">Select Verified Provider</h2>
          <p className="text-xs text-sky-300 truncate max-w-[240px]">“{userPromptText}”</p>
        </div>
      </div>

      {/* Clearly labeled Demo Verified Biller Directory Banner */}
      <div className="mt-3.5 p-3.5 rounded-2xl bg-sky-950 border-2 border-sky-600/70 text-sky-100 shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Demo BBPS Verified Directory
          </span>
        </div>
        <p className="text-xs text-slate-200 mt-1 leading-relaxed">
          For your safety, utility payments only show providers from this verified demo directory. No unverified third-party merchants allowed.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
        {(['electricity', 'water', 'gas', 'broadband'] as BillerCategory[]).map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                sound.playTap();
                setSelectedCategory(cat);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? 'bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
              }`}
            >
              {getCategoryIcon(cat)}
              <span className="capitalize">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative mt-3.5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${selectedCategory} providers or state...`}
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
        />
      </div>

      {/* Billers List */}
      <div className="mt-3.5 space-y-2.5 flex-1 overflow-y-auto pb-4">
        {filteredBillers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium">
            No verified providers found matching "{searchQuery}".
          </div>
        ) : (
          filteredBillers.map((biller) => (
            <div
              key={biller.id}
              onClick={() => {
                sound.playTap();
                onSelectBiller(biller);
              }}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-sky-400 transition cursor-pointer flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(biller.category)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition">
                      {biller.name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      BBPS Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 font-medium">
                    <span>{biller.state}</span>
                    <span>•</span>
                    <span className="text-sky-300 font-mono text-[11px]">{biller.bbpsId}</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-300 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
