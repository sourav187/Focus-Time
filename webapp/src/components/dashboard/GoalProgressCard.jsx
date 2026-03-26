import React from 'react';
import { Clock, Lock, Circle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function GoalProgressCard({ 
  isLoading, 
  isGoalSet, 
  totalFocusMinutes, 
  dailyGoalMinutes, 
  progressPercentage, 
  onAddGoal 
}) {
  // Status System
  let goalStatus = "Not Started";
  let statusColor = "bg-[#B4A594]";
  let StatusIcon = Circle;

  if (totalFocusMinutes >= dailyGoalMinutes && dailyGoalMinutes > 0) {
    goalStatus = "Goal Achieved!";
    statusColor = "bg-[#10B981]";
    StatusIcon = CheckCircle2;
  } else if (totalFocusMinutes > 0) {
    goalStatus = "In Progress";
    statusColor = "bg-[#E89D71]";
    StatusIcon = AlertCircle;
  }

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h > 0) return (
      <>
        <span>{h}</span><span className="text-sm font-medium opacity-60 ml-0.5 mr-1.5 underline underline-offset-4 decoration-2 decoration-[var(--app-accent)]/30">h</span>
        <span>{m}</span><span className="text-sm font-medium opacity-60 ml-0.5">m</span>
      </>
    );
    return (
      <>
        <span>{m}</span><span className="text-sm font-medium opacity-60 ml-0.5">m</span>
      </>
    );
  };

  return (
    <div className="w-full max-w-md bg-[var(--app-card)] p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[var(--app-border)] transition-all duration-300 min-h-[160px] flex flex-col justify-center">
      {isLoading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[var(--app-text-muted)] font-bold text-sm uppercase tracking-wider">Today's Goal 🎯</h3>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors duration-300 ${statusColor}`}>
              <StatusIcon size={12} strokeWidth={3} />
              <span>{goalStatus}</span>
            </div>
          </div>
 
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              {isGoalSet ? (
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-[var(--app-text)] tracking-tight flex items-baseline">
                    <span className="text-[var(--app-accent)]">{formatTime(totalFocusMinutes)}</span>
                    <span className="text-[var(--app-text-muted)] mx-3 text-2xl font-light">/</span>
                    <span className="opacity-90">{formatTime(dailyGoalMinutes)}</span>
                  </h2>
                  <div className="text-[var(--app-text-muted)] opacity-40 ml-1" title="Goal locked for today">
                    <Lock size={16} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={onAddGoal}
                  className="bg-[var(--app-bg)] hover:bg-[var(--app-border)] text-[var(--app-accent)] font-bold py-2.5 px-6 rounded-2xl transition-all flex items-center gap-2 border-2 border-dashed border-[var(--app-accent)] border-opacity-30"
                >
                  <Clock size={18} />
                  <span>Add Daily Goal</span>
                </button>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[var(--app-accent)] opacity-70">{progressPercentage}%</span>
            </div>
          </div>

          <div className={`relative w-full h-4 bg-[var(--app-border)] rounded-full overflow-hidden transition-all duration-500 ${totalFocusMinutes >= dailyGoalMinutes && isGoalSet ? 'ring-2 ring-green-500' : ''}`}>
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out 
                ${totalFocusMinutes >= dailyGoalMinutes && isGoalSet
                  ? 'bg-gradient-to-r from-green-500 to-[#10B981] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'bg-gradient-to-r from-[var(--app-accent)] to-[#f4a261]'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {totalFocusMinutes >= dailyGoalMinutes && isGoalSet && (
            <div className="mt-3 text-center text-green-600 font-bold text-xs uppercase tracking-[0.2em] animate-bounce">
              🎉 Goal Achieved!
            </div>
          )}
        </>
      )}
    </div>
  );
}
