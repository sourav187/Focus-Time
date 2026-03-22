import React from 'react';
import { Play, Pause, RotateCcw, Zap, Coffee, Settings } from 'lucide-react';

export default function TimerDisplay({ 
  timerMode, 
  setTimerMode, 
  timeLeft, 
  formatTime, 
  isActive, 
  toggleTimer, 
  resetTimer, 
  isGoalSet, 
  completedSessions,
  isSettingsOpen,
  setIsSettingsOpen,
  timerSettings,
  setTimerSettings
}) {
  return (
    <div className="flex flex-col items-center gap-12 w-full">
      {/* Timer Mode Selector */}
      <div className="flex gap-2 bg-[var(--app-bg)] p-1.5 rounded-2xl border border-[var(--app-border)] shadow-sm">
        <button
          onClick={() => setTimerMode('focus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${timerMode === 'focus' ? 'bg-[var(--app-accent)] text-white shadow-md' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-card)]'}`}
        >
          <Zap size={14} />
          Focus
        </button>
        <button
          onClick={() => setTimerMode('shortBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${timerMode === 'shortBreak' ? 'bg-[#10B981] text-white shadow-md' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-card)]'}`}
        >
          <Coffee size={14} />
          Short Break
        </button>
        <button
          onClick={() => setTimerMode('longBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${timerMode === 'longBreak' ? 'bg-[#059669] text-white shadow-md' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-card)]'}`}
        >
          <Coffee size={14} />
          Long Break
        </button>
        <div className="w-[1px] bg-[var(--app-border)] mx-1"></div>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 rounded-xl transition-all ${isSettingsOpen ? 'bg-[var(--app-card)] text-[var(--app-text)] shadow-inner' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-card)]'}`}
        >
          <Settings size={18} className={isSettingsOpen ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
        </button>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="w-full max-w-sm bg-[var(--app-card)] p-6 rounded-3xl shadow-xl border border-[var(--app-border)] animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-[var(--app-text)] font-bold text-sm mb-4 flex items-center gap-2">
             <Settings size={16} /> 
             Timer Settings
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[var(--app-text-muted)]">Focus duration (min)</label>
              <input 
                type="number" 
                value={timerSettings.focusDuration} 
                onChange={(e) => setTimerSettings({...timerSettings, focusDuration: parseInt(e.target.value) || 1})}
                className="w-16 bg-[var(--app-bg)] border-transparent border-2 focus:border-[var(--app-accent)] rounded-lg p-1 text-center font-bold text-sm outline-none text-[var(--app-text)]"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[var(--app-text-muted)]">Short break (min)</label>
              <input 
                type="number" 
                value={timerSettings.shortBreakDuration} 
                onChange={(e) => setTimerSettings({...timerSettings, shortBreakDuration: parseInt(e.target.value) || 1})}
                className="w-16 bg-[var(--app-bg)] border-transparent border-2 focus:border-[#10B981] rounded-lg p-1 text-center font-bold text-sm outline-none text-[var(--app-text)]"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[var(--app-text-muted)]">Long break (min)</label>
              <input 
                type="number" 
                value={timerSettings.longBreakDuration} 
                onChange={(e) => setTimerSettings({...timerSettings, longBreakDuration: parseInt(e.target.value) || 1})}
                className="w-16 bg-[var(--app-bg)] border-transparent border-2 focus:border-[#059669] rounded-lg p-1 text-center font-bold text-sm outline-none text-[var(--app-text)]"
              />
            </div>
            <div className="pt-2 mt-2 border-t border-[var(--app-border)] border-dashed flex justify-between items-center">
              <label className="text-xs font-medium text-[var(--app-text-muted)]">Long break after</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={timerSettings.sessionsBeforeLongBreak} 
                  onChange={(e) => setTimerSettings({...timerSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 1})}
                  className="w-12 bg-[var(--app-bg)] border-transparent border-2 focus:border-[var(--app-accent)] rounded-lg p-1 text-center font-bold text-sm outline-none text-[var(--app-text)]"
                />
                <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-tight">Sessions</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer UI */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div 
          className={`text-[8rem] leading-none font-medium tracking-tighter drop-shadow-sm tabular-nums transition-colors duration-500
            ${timerMode === 'focus' ? 'text-[var(--app-text)]' : timerMode === 'shortBreak' ? 'text-[#10B981]' : 'text-[#059669]'}`}
        >
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] mt-2 mb-4">
          {timerMode === 'focus' ? 'Time to focus' : 'Rest time'} • {completedSessions} sessions done
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleTimer}
            disabled={!isGoalSet}
            title={!isGoalSet ? "Please set a daily goal first" : ""}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 shadow-sm active:scale-95 ${!isGoalSet
              ? 'bg-[var(--app-bg)] text-[var(--app-text-muted)] cursor-not-allowed border-2 border-dashed border-[var(--app-border)] opacity-70'
              : isActive
                ? 'bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-bg)]'
                : timerMode === 'focus'
                  ? 'bg-[var(--app-accent)] text-white hover:bg-[#d68b60] hover:shadow-md hover:-translate-y-0.5'
                  : 'bg-[#10B981] text-white hover:bg-[#059669] hover:shadow-md hover:-translate-y-0.5'
              }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className={!isGoalSet ? "" : "ml-1"} />}
            <span>{isActive ? 'Pause' : (timerMode === 'focus' ? 'Start Focus' : 'Start Break')}</span>
          </button>
          <button
            onClick={resetTimer}
            disabled={!isGoalSet}
            title={!isGoalSet ? "Please set a daily goal first" : ""}
            className={`p-4 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] transition-all duration-300 shadow-sm active:scale-95 ${!isGoalSet
              ? 'text-[var(--app-text-muted)] cursor-not-allowed opacity-50 grayscale'
              : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)] hover:-translate-y-0.5'
              }`}
            aria-label="Reset Timer"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
