import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';
import { useTasks } from '../../context/TaskContext';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function PlannedVsActualChart() {
  const { tasks, dailyHistory, todayFocus, todayStr } = useTasks();
  const [weekOffset, setWeekOffset] = useState(0);

  const getPlannedVsActualData = () => {
    const dataMap = {};
    const today = new Date();

    // Calculate start date based on weekOffset
    const start = new Date();
    start.setDate(today.getDate() - 6 + (weekOffset * 7));

    // Initialize 7 days range
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.getDate();
      dataMap[dStr] = {
        name: dayLabel,
        fullDate: dStr,
        display: `${dayLabel} ${dayNum}`,
        planned: 0,
        actual: 0
      };
    }

    // Aggregate tasks for PLANNED time
    tasks.forEach(task => {
      // Use both single date and date range tasks
      if (task.date && dataMap[task.date]) {
        dataMap[task.date].planned += Number(task.needed || 0);
      }
    });

    // Aggregate daily stats for ACTUAL focus time
    dailyHistory.forEach(record => {
      const dateStr = record.stats_date;
      if (dataMap[dateStr]) {
        dataMap[dateStr].actual = Number(record.total_focus_hours || 0);
      }
    });

    // Live update for today's focus time
    if (dataMap[todayStr]) {
      dataMap[todayStr].actual = todayFocus;
    }

    // Convert to array and round values
    return Object.values(dataMap).map(day => ({
      ...day,
      planned: Number(day.planned.toFixed(1)),
      actual: Number(day.actual.toFixed(1))
    }));
  };

  const data = getPlannedVsActualData();

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);
  const handleReset = () => setWeekOffset(0);

  // Date range label
  const getRangeLabel = () => {
    if (data.length === 0) return '';
    const first = new Date(data[0].fullDate);
    const last = new Date(data[data.length - 1].fullDate);
    const options = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString(undefined, options)} - ${last.toLocaleDateString(undefined, options)}`;
  };

  return (
    <div className="bg-[var(--app-card)] p-8 rounded-[2rem] shadow-lg border border-[var(--app-border)] lg:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--app-text)]">Planned vs Actual</h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-[var(--app-text-muted)]" />
            <p className="text-sm text-[var(--app-text-muted)] font-medium">{getRangeLabel()}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-600 dark:bg-slate-500"></div>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--app-accent)]"></div>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[var(--app-accent)]"></div>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">Trend</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center bg-[var(--app-bg)] p-1 rounded-2xl border border-[var(--app-border)]">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-[var(--app-card)] hover:shadow-sm rounded-xl transition-all text-[var(--app-text)]"
              title="Previous Week"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleReset}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${weekOffset === 0 ? 'bg-[var(--app-card)] shadow-sm text-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}`}
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-[var(--app-card)] hover:shadow-sm rounded-xl transition-all text-[var(--app-text)]"
              title="Next Week"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
            <XAxis
              dataKey="display"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--app-text-muted)', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--app-text-muted)', fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--app-bg)', radius: 10 }}
              contentStyle={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                backgroundColor: 'var(--app-card)',
                color: 'var(--app-text)',
                fontWeight: 600
              }}
              formatter={(value, name) => {
                if (name === 'Trend') return [null, null];
                return [`${value} hrs`, name];
              }}
            />
            
            {/* Bars */}
            <Bar
              dataKey="planned"
              fill="rgba(71, 85, 105, 0.4)"
              radius={[6, 6, 0, 0]}
              barSize={24}
              name="Planned Time"
            />
            <Bar
              dataKey="actual"
              fill="url(#actualGradient)"
              radius={[6, 6, 0, 0]}
              barSize={24}
              name="Actual Focus"
            />

            {/* Trend Line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--app-accent)"
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--app-accent)', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name="Trend"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
