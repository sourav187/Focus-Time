import React from 'react';
import { Clock, CalendarDays, Flame } from 'lucide-react';

export default function QuickStatsOverview({ focusTimeStr, sessions, streak }) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-4">
      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 bg-[#FAF8F5] rounded-2xl text-[#8C7A6B]">
          <Clock size={28} />
        </div>
        <div>
          <p className="text-sm text-[#8C7A6B] font-medium">Today's Focus</p>
          <p className="text-2xl font-semibold mt-1">{focusTimeStr}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 bg-[#FAF8F5] rounded-2xl text-[#8C7A6B]">
          <CalendarDays size={28} />
        </div>
        <div>
          <p className="text-sm text-[#8C7A6B] font-medium">Sessions</p>
          <p className="text-2xl font-semibold mt-1">{sessions}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 bg-[#e89d711a] rounded-2xl text-[#E89D71]">
          <Flame size={28} />
        </div>
        <div>
          <p className="text-sm text-[#8C7A6B] font-medium">Current Streak</p>
          <p className="text-2xl font-semibold mt-1">{streak} {streak === 1 ? 'day' : 'days'}</p>
        </div>
      </div>
    </div>
  );
}
