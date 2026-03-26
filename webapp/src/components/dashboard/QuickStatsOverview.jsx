import React from 'react';
import { Clock, CalendarDays, Flame } from 'lucide-react';

export default function QuickStatsOverview({ focusTimeStr, sessions, streak }) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-4">
      <div className="bg-[var(--app-card)] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--app-border)] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 bg-[var(--app-bg)] rounded-2xl text-[var(--app-text-muted)]">
          <Clock size={28} />
        </div>
        <div>
          <p className="text-sm text-[var(--app-text-muted)] font-medium">Today's Focus</p>
          <p className="text-2xl font-semibold mt-1 text-[var(--app-text)]">{focusTimeStr}</p>
        </div>
      </div>

      <div className="bg-[var(--app-card)] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--app-border)] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 bg-[var(--app-bg)] rounded-2xl text-[var(--app-text-muted)]">
          <CalendarDays size={28} />
        </div>
        <div>
          <p className="text-sm text-[var(--app-text-muted)] font-medium">Sessions</p>
          <p className="text-2xl font-semibold mt-1 text-[var(--app-text)]">{sessions}</p>
        </div>
      </div>

      <div className="bg-[var(--app-card)] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--app-border)] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
        <div className="p-4 bg-[var(--app-accent-muted)] rounded-2xl text-[var(--app-accent)]">
          <Flame size={28} />
        </div>
        <div>
          <p className="text-sm text-[var(--app-text-muted)] font-medium">Current Streak</p>
          <p className="text-2xl font-semibold mt-1 text-[var(--app-text)]">{streak} {streak === 1 ? 'day' : 'days'}</p>
        </div>
      </div>
    </div>
  );
}
