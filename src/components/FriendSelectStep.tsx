import React, { useState } from 'react';
import { FriendContact } from '../types/assistant';
import { MOCK_FRIENDS_LIST } from '../data/mockFriends';
import {
  ShieldCheck,
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Phone,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { sound } from '../utils/audioEffects';

interface FriendSelectStepProps {
  onSelectFriend: (friend: FriendContact, amount: number) => void;
  onCancel: () => void;
  defaultAmount?: number;
}

export const FriendSelectStep: React.FC<FriendSelectStepProps> = ({
  onSelectFriend,
  onCancel,
  defaultAmount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<FriendContact | null>(null);
  const [amount, setAmount] = useState<number>(defaultAmount || 1200);
  const [showVerificationDetails, setShowVerificationDetails] = useState<string | null>(null);

  const filteredFriends = MOCK_FRIENDS_LIST.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.upiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery)
  );

  const handlePickFriend = (friend: FriendContact) => {
    sound.playTap();
    setSelectedFriend(friend);
    if (!defaultAmount && friend.suggestedAmount) {
      setAmount(friend.suggestedAmount);
    }
  };

  const handleProceed = () => {
    if (!selectedFriend) return;
    sound.playTap();
    onSelectFriend(selectedFriend, amount);
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
            <h2 className="text-base font-bold text-white">Pay to Friends</h2>
            <p className="text-xs text-sky-300 font-medium">Sample contacts with UPI IDs</p>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="p-3.5 rounded-2xl bg-sky-950 border-2 border-sky-600/70 text-sky-100 shadow-md">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Demo contact directory
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            This prototype uses fictional contacts and simulated risk labels. It does not read your phone contacts or check bank KYC, Aadhaar, account age, or dispute history.
          </p>
        </div>

        {/* Search Contact Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by friend’s name, phone, or UPI ID..."
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        {/* Friends List */}
        <div className="space-y-2.5">
          <span className="text-xs uppercase tracking-wider font-bold text-sky-300 px-1 block">
            Select Contact ({filteredFriends.length})
          </span>

          {filteredFriends.map((friend) => {
            const isSelected = selectedFriend?.id === friend.id;
            return (
              <div
                key={friend.id}
                onClick={() => handlePickFriend(friend)}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer space-y-2 shadow-sm ${
                  isSelected
                    ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-500/30'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: friend.avatarColor }}
                    >
                      {friend.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white">{friend.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium">({friend.relationship})</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-sky-300 font-mono mt-0.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{friend.upiId}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{friend.phone}</span>
                        <span>•</span>
                        <span className="text-slate-300">{friend.bankName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Pill */}
                  <div className="shrink-0 flex flex-col items-end">
                    {friend.isVerifiedUser ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Demo profile match</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600 shadow-sm">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Demo risk flag</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanation Card */}
                <div
                  className={`p-2.5 rounded-xl text-xs leading-relaxed border ${
                    friend.isVerifiedUser
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-amber-950/50 border-amber-800/70 text-amber-200'
                  }`}
                >
                  <p>{friend.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Friend Amount Input Card */}
        {selectedFriend && (
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-sky-500/80 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-300">
                Payment Amount for {selectedFriend.name}
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
              {[500, 1200, 5000, 15000].map((amt) => (
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
          disabled={!selectedFriend || !amount || amount <= 0}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
            !selectedFriend || !amount || amount <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
          }`}
        >
          <span>Continue to Verification Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


