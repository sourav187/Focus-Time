import React, { useMemo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTasks } from '../../context/TaskContext';

// --- Sub-component: Portal-based Tooltip ---
const TooltipPortal = ({ x, y, content, visible }) => {
  if (!visible) return null;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+12px)] transition-all duration-200 animate-in fade-in zoom-in-95 origin-bottom"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="bg-[#1E293B] dark:bg-slate-900 text-white px-3 py-2 rounded-xl text-[11px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10 whitespace-nowrap">
        {content}
        {/* The Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1E293B] dark:border-t-slate-900" />
      </div>
    </div>,
    document.body
  );
};

export default function FocusActivityHeatmap() {
  const { dailyHistory, tasks, todayStr } = useTasks();
  const scrollRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

  // Auto-scroll to end on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  // Configuration
  const WEEKS_TO_SHOW = 53; // ~1 year

  const activityData = useMemo(() => {
    const data = {};

    // 1. Mark existing history
    dailyHistory.forEach(h => {
      data[h.stats_date] = Number(h.total_focus_hours || 0);
    });

    // 2. Also check tasks
    tasks.forEach(task => {
      if (task.logged > 0 && task.date) {
        if (!data[task.date] || data[task.date] < task.logged) {
          data[task.date] = Number(task.logged);
        }
      }
    });

    const grid = [];
    const now = new Date();

    // GitHub alignments: Rightmost column is the current week.
    // Sunday is always index 0 (top row).
    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() - now.getDay());

    for (let w = 0; w < WEEKS_TO_SHOW; w++) {
      const week = [];
      const weekStart = new Date(currentSunday);
      weekStart.setDate(currentSunday.getDate() - (WEEKS_TO_SHOW - 1 - w) * 7);

      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + d);

        const dateStr = date.toISOString().split('T')[0];
        const hours = data[dateStr] || 0;
        const isFuture = dateStr > todayStr; // Match string based for safety

        week.push({
          date: dateStr,
          dayLabel: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
          hours: Number(hours.toFixed(1)),
          // Level -1 for future, 0-4 for historical/today
          level: isFuture ? -1 : getLevel(hours)
        });
      }
      grid.push(week);
    }
    return grid;
  }, [dailyHistory, tasks, todayStr, WEEKS_TO_SHOW]);

  function getLevel(hours) {
    if (hours === 0) return 0;
    if (hours < 1) return 1;
    if (hours < 3) return 2;
    if (hours < 5) return 3;
    return 4;
  }

  const getColor = (level) => {
    switch (level) {
      case -1: return 'bg-slate-100 dark:bg-slate-800/30 opacity-30 border-transparent cursor-default';
      case 0: return 'bg-[var(--app-heatmap-L0)] border-transparent transition-colors';
      case 1: return 'bg-[var(--app-heatmap-L1)] border-black/5 dark:border-white/5 hover:border-[var(--app-heatmap-L2)]';
      case 2: return 'bg-[var(--app-heatmap-L2)] border-black/5 dark:border-white/5 hover:border-[var(--app-heatmap-L3)]';
      case 3: return 'bg-[var(--app-heatmap-L3)] border-black/5 dark:border-white/5 hover:border-[var(--app-heatmap-L4)]';
      case 4: return 'bg-[var(--app-heatmap-L4)] border-black/5 dark:border-white/5 opacity-90 hover:opacity-100';
      default: return 'bg-[var(--app-heatmap-L0)]';
    }
  };

  const handleMouseEnter = (e, day) => {
    if (day.level === -1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content: (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-black text-xs text-indigo-300 tracking-tight">{day.hours}h focus</span>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{day.dayLabel}</div>
        </div>
      )
    });
  };

  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, visible: false }));

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;

    activityData.forEach((week, i) => {
      const date = new Date(week[0].date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({ label: date.toLocaleDateString(undefined, { month: 'short' }), index: i });
        lastMonth = month;
      }
    });
    return labels;
  }, [activityData]);

  const { totalFocusTime, currentStreak: contextStreak } = useTasks();

  return (
    <div className="bg-[var(--app-card)] p-8 rounded-[2rem] shadow-lg border border-[var(--app-border)]">
      {/* 1. Portal Tooltip (always outside scroller) */}
      <TooltipPortal {...tooltip} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--app-text)]">Focus Activity</h3>
          <p className="text-sm text-[var(--app-text-muted)] font-medium mt-1">Consistency over the last year</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
          <span>Less</span>
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2, 3, 4].map(l => (
              <div key={l} className={`w-[11px] h-[11px] rounded-sm ${getColor(l)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto no-scrollbar pb-2 scroll-smooth pt-8"
      >
        <div className="min-w-max pr-4">
          {/* Month Labels Grid - Matches Heatmap Grid Exactly */}
          <div
            className="grid mb-4 h-4 ml-[41px] pointer-events-none"
            style={{
              gridTemplateColumns: `repeat(${WEEKS_TO_SHOW}, 11px)`,
              columnGap: '5px'
            }}
          >
            {monthLabels.map((m, i) => {
              if (m.index < 2) return null;
              return (
                <span
                  key={i}
                  className="text-[10px] font-bold text-[var(--app-text-muted)] opacity-60 uppercase whitespace-nowrap"
                  style={{ gridColumnStart: m.index + 1 }}
                >
                  {m.label}
                </span>
              );
            })}
          </div>

          <div className="flex gap-[5px] focus-activity-grid">
            {/* Day Labels Column */}
            <div className="flex flex-col gap-[5px] mr-2 mt-0.5 w-[31px] shrink-0">
              {['Sun', '', 'Tue', '', 'Thu', '', 'Sat'].map((day, di) => (
                <span key={di} className="text-[9px] font-bold text-[var(--app-text-muted)] opacity-50 h-[11px] flex items-center leading-none tracking-tighter uppercase whitespace-nowrap">{day}</span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[5px]">
              {activityData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[5px] relative hover:z-20 transition-all duration-300">
                  {week.map((day, di) => (
                    <div
                      key={day.date}
                      onMouseEnter={(e) => handleMouseEnter(e, day)}
                      onMouseLeave={handleMouseLeave}
                      className={`w-[11px] h-[11px] rounded-[2px] border-[0.5px] transition-all duration-300 hover:scale-125 cursor-pointer relative ${getColor(day.level)}`}
                    >
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center text-[11px] text-[var(--app-text-muted)] font-medium border-t border-[var(--app-border)] pt-5">
        <div className="flex gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Total Focused: <span className="font-bold text-[var(--app-text)] tracking-tight">{totalFocusTime.toFixed(1)}h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#30a14e] dark:bg-[#39d353]" />
            Current Streak: <span className="font-bold text-[var(--app-text)] tracking-tight">{contextStreak} days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
