import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, ShieldCheck } from 'lucide-react';

interface PhoneStatusBarProps {
  onDirectoryClick?: () => void;
  onHistoryClick?: () => void;
  historyCount?: number;
}

export const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({
  onDirectoryClick,
  onHistoryClick,
  historyCount = 0,
}) => {
  const [timeStr, setTimeStr] = useState('12:10 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 text-white px-4 pt-2.5 pb-2 flex items-center justify-between text-xs select-none border-b border-slate-700/80 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-bold text-white text-[13px] tracking-tight">{timeStr}</span>
        <div className="flex items-center gap-1 bg-sky-950 text-sky-300 border border-sky-600/60 px-2 py-0.5 rounded-full text-[10px] font-semibold">
          <ShieldCheck className="w-3 h-3 text-sky-400" />
          <span>AuraPay Safe</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-200">
        {onDirectoryClick && (
          <button
            onClick={onDirectoryClick}
            title="Browse Verified Biller Directory"
            className="text-[11px] text-sky-200 hover:text-white bg-sky-900/80 hover:bg-sky-800 px-2.5 py-1 rounded-md border border-sky-600/70 cursor-pointer transition font-semibold"
          >
            Directory
          </button>
        )}
        {onHistoryClick && (
          <button
            onClick={onHistoryClick}
            title="View Simulated Transactions"
            className="text-[11px] text-white hover:text-sky-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-600 cursor-pointer transition font-semibold flex items-center gap-1.5"
          >
            <span>Receipts</span>
            {historyCount > 0 && (
              <span className="bg-sky-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
        )}
        <Wifi className="w-4 h-4 text-white ml-1" />
        <BatteryMedium className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};
