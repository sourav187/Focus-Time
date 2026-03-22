import React from 'react';
import { TrendingUp, Award, Clock, Calendar, AlertCircle } from 'lucide-react';
import PlannedVsActualChart from '../components/charts/PlannedVsActualChart';
import FocusActivityHeatmap from '../components/charts/FocusActivityHeatmap';
import { useTasks } from '../context/TaskContext';

export default function StatsView() {
  const { totalFocusTime, currentStreak, tasks, todayStr, todayFocus } = useTasks();

  const finishedTasks = tasks.filter(t => t.logged >= t.needed).length;
  const todayTasksList = tasks.filter(t => t.date === todayStr);
  const todayTaskCount = todayTasksList.length;
  const todayPlannedHours = todayTasksList.reduce((acc, t) => acc + (t.needed || 0), 0);
  const todayCompletedTasks = todayTasksList.filter(t => t.logged >= t.needed).length;
  const focusProgress = todayPlannedHours > 0 ? Math.min((todayFocus / todayPlannedHours) * 100, 100) : 0;

  const isCompleted = focusProgress >= 100 && todayTaskCount > 0;
  const isEmpty = todayTaskCount === 0;

  // Tomorrow's Plan
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
  const tomorrowTasks = tasks.filter(t => t.date === tomorrowStr);
  const tomorrowTaskCount = tomorrowTasks.length;
  const tomorrowPlannedHours = tomorrowTasks.reduce((acc, t) => acc + (t.needed || 0), 0);

  // Overdue Tasks
  const overdueTasks = tasks.filter(t => t.date < todayStr && t.logged < t.needed);
  const overdueCount = overdueTasks.length;
  const overdueHours = overdueTasks.reduce((acc, t) => acc + (t.needed - t.logged), 0);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-10 w-full animate-in fade-in zoom-in-95 duration-500">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--app-text)]">Deep Productivity Insights</h2>
        <p className="text-[var(--app-text-muted)] font-medium text-lg">Detailed overview of your focus trends and task execution.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Focus - PRIMARY STRONG */}
        <div className={`p-5 rounded-3xl shadow-[0_20px_40px_rgba(232,157,113,0.25)] border border-white/20 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 group text-white ${isCompleted ? 'bg-gradient-to-br from-[#10B981] to-[#059669]' : 'bg-gradient-to-br from-[#FF9D6C] to-[#E89D71]'}`}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors duration-500 opacity-60" />

          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white w-max transition-all duration-300 group-hover:scale-110 relative z-10 border border-white/10">
            {isCompleted ? <Award size={18} strokeWidth={2.5} /> : <TrendingUp size={18} strokeWidth={2.5} />}
          </div>
          <div className="relative z-10">
            <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider">{isCompleted ? 'Day Goal Reached!' : "Today's Focus"}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <h3 className="text-3xl font-black">{todayFocus.toFixed(1)}h</h3>
              <span className="text-sm text-white/70 font-semibold">/ {todayPlannedHours.toFixed(1)}h</span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.8)] ${isCompleted ? 'bg-white' : 'bg-white'}`}
                  style={{ width: `${isEmpty ? 0 : focusProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-white/90">
                <span>{isEmpty ? 'No tasks' : `${Math.round(focusProgress)}%`}</span>
                <span>{isEmpty ? 'Plan your day' : `${todayCompletedTasks} / ${todayTaskCount} tasks`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tomorrow's Plan - SOFT LIGHT GREEN */}
        <div className="bg-[var(--app-card)] p-5 rounded-3xl shadow-sm border border-[var(--app-border)] flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl opacity-60" />

          <div className="p-3 bg-[var(--app-bg)] rounded-2xl text-emerald-500 shadow-sm w-max transition-all duration-300 group-hover:scale-110 relative z-10 border border-[var(--app-border)]">
            <Calendar size={18} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] text-[var(--app-text-muted)] font-bold uppercase tracking-wider">Tomorrow's Plan</p>
            {tomorrowTaskCount > 0 ? (
              <>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <h3 className="text-3xl font-black text-[var(--app-text)]">{tomorrowTaskCount}</h3>
                  <span className="text-sm text-[var(--app-text-muted)] font-semibold">tasks</span>
                </div>
                <p className="text-[11px] text-emerald-500 font-bold mt-0.5">{tomorrowPlannedHours.toFixed(1)}h planned</p>
              </>
            ) : (
              <div className="mt-1">
                <h3 className="text-xl font-black text-[var(--app-text)]">Blank Canvas</h3>
                <p className="text-[10px] text-[var(--app-text-muted)] font-semibold leading-tight mt-1 uppercase tracking-tight">Nothing planned. Enjoy your freedom!</p>
              </div>
            )}
          </div>
        </div>

        {/* Overdue Tasks - RED ALERT */}
        <div className={`${overdueCount > 0 ? 'bg-[var(--app-card)] border-red-500/20 shadow-sm animate-soft-pulse' : 'bg-[var(--app-card)] border-[var(--app-border)] shadow-sm'} p-5 rounded-3xl border flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 group`}>
          <div className={`absolute -right-4 -top-4 w-24 h-24 ${overdueCount > 0 ? 'bg-red-500/10' : 'bg-[var(--app-text-muted)]/5'} rounded-full blur-2xl group-hover:opacity-100 transition-colors duration-500 opacity-60`} />

          <div className={`p-3 rounded-2xl ${overdueCount > 0 ? 'bg-[var(--app-bg)] text-red-500 border-red-500/20' : 'bg-[var(--app-bg)] text-emerald-500 border-[var(--app-border)]'} shadow-sm w-max transition-all duration-300 group-hover:scale-110 relative z-10 border`}>
            {overdueCount > 0 ? <AlertCircle size={18} strokeWidth={2.5} /> : <Award size={18} strokeWidth={2.5} />}
          </div>
          <div className="relative z-10">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--app-text-muted)]'}`}>Backlog</p>
            {overdueCount > 0 ? (
              <>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <h3 className="text-3xl font-black text-red-500">{overdueCount}</h3>
                  <span className="text-sm text-red-500/70 font-semibold">tasks</span>
                </div>
                <p className="text-[11px] text-red-500/60 font-medium mt-0.5">{overdueHours.toFixed(1)}h pending</p>
              </>
            ) : (
              <div className="mt-1">
                <h3 className="text-xl font-black text-emerald-500">Clear Skies</h3>
                <p className="text-[10px] text-emerald-500/60 font-semibold leading-tight mt-1 uppercase tracking-tight">You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Streak - NEUTRAL ACCENT */}
        <div className="bg-[var(--app-card)] p-5 rounded-3xl shadow-sm border border-[var(--app-border)] flex flex-col gap-3 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl opacity-60" />

          <div className="p-3 bg-[var(--app-bg)] rounded-2xl text-rose-500 shadow-sm w-max transition-all duration-300 group-hover:scale-110 relative z-10 border border-[var(--app-border)]">
            <Award size={18} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] text-[var(--app-text-muted)] font-bold uppercase tracking-wider">Current Streak</p>
            <h3 className="text-3xl font-black text-[var(--app-text)] mt-0.5">{currentStreak || 0}<span className="text-sm text-[var(--app-text-muted)] font-semibold ml-1">days</span></h3>
          </div>
        </div>
      </div>

      {/* Planned vs Actual - Wide Chart */}
      <div className="w-full">
        <PlannedVsActualChart />
      </div>

      {/* Activity Heatmap - Full Width Area */}
      <div className="w-full">
        <FocusActivityHeatmap />
      </div>

    </main>
  );
}
