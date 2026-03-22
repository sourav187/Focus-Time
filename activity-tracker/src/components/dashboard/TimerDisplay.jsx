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
      <div className="flex gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#F4EFE6] shadow-sm">
        <button
          onClick={() => setTimerMode('focus')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${timerMode === 'focus' ? 'bg-[#E89D71] text-white shadow-md' : 'text-[#8C7A6B] hover:bg-white'}`}
        >
          <Zap size={14} />
          Focus
        </button>
        <button
          onClick={() => setTimerMode('shortBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${timerMode === 'shortBreak' ? 'bg-[#10B981] text-white shadow-md' : 'text-[#8C7A6B] hover:bg-white'}`}
        >
          <Coffee size={14} />
          Short Break
        </button>
        <button
          onClick={() => setTimerMode('longBreak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${timerMode === 'longBreak' ? 'bg-[#059669] text-white shadow-md' : 'text-[#8C7A6B] hover:bg-white'}`}
        >
          <Coffee size={14} />
          Long Break
        </button>
        <div className="w-[1px] bg-[#F4EFE6] mx-1"></div>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 rounded-xl transition-all ${isSettingsOpen ? 'bg-white text-[#4A3F35] shadow-inner' : 'text-[#8C7A6B] hover:bg-white'}`}
        >
          <Settings size={18} className={isSettingsOpen ? 'rotate-90 transition-transform duration-300' : 'transition-transform duration-300'} />
        </button>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="w-full max-w-sm bg-white p-6 rounded-3xl shadow-xl border border-[#F4EFE6] animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-[#4A3F35] font-bold text-sm mb-4 flex items-center gap-2">
             <Settings size={16} /> 
             Timer Settings
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[#8C7A6B]">Focus duration (min)</label>
              <input 
                type="number" 
                value={timerSettings.focusDuration} 
                onChange={(e) => setTimerSettings({...timerSettings, focusDuration: parseInt(e.target.value) || 1})}
                className="w-16 bg-[#FAF8F5] border-transparent border-2 focus:border-[#E89D71] rounded-lg p-1 text-center font-bold text-sm outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[#8C7A6B]">Short break (min)</label>
              <input 
                type="number" 
                value={timerSettings.shortBreakDuration} 
                onChange={(e) => setTimerSettings({...timerSettings, shortBreakDuration: parseInt(e.target.value) || 1})}
                className="w-16 bg-[#FAF8F5] border-transparent border-2 focus:border-[#10B981] rounded-lg p-1 text-center font-bold text-sm outline-none"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-[#8C7A6B]">Long break (min)</label>
              <input 
                type="number" 
                value={timerSettings.longBreakDuration} 
                onChange={(e) => setTimerSettings({...timerSettings, longBreakDuration: parseInt(e.target.value) || 1})}
                className="w-16 bg-[#FAF8F5] border-transparent border-2 focus:border-[#059669] rounded-lg p-1 text-center font-bold text-sm outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Timer UI */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div 
          className={`text-[8rem] leading-none font-medium tracking-tighter drop-shadow-sm tabular-nums transition-colors duration-500
            ${timerMode === 'focus' ? 'text-[#4A3F35]' : timerMode === 'shortBreak' ? 'text-[#10B981]' : 'text-[#059669]'}`}
        >
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-xs font-bold uppercase tracking-widest text-[#B4A594] mt-2 mb-4">
          {timerMode === 'focus' ? 'Time to focus' : 'Rest time'} • {completedSessions} sessions done
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleTimer}
            disabled={!isGoalSet}
            title={!isGoalSet ? "Please set a daily goal first" : ""}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 shadow-sm active:scale-95 ${!isGoalSet
              ? 'bg-[#FAF8F5] text-[#B4A594] cursor-not-allowed border-2 border-dashed border-[#B4A594] opacity-70'
              : isActive
                ? 'bg-white text-[#4A3F35] border border-[#E5E5E5] hover:bg-gray-50'
                : timerMode === 'focus'
                  ? 'bg-[#E89D71] text-white hover:bg-[#d68b60] hover:shadow-md hover:-translate-y-0.5'
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
            className={`p-4 rounded-full bg-white border border-[#F4EFE6] transition-all duration-300 shadow-sm active:scale-95 ${!isGoalSet
              ? 'text-[#B4A594] cursor-not-allowed opacity-50 grayscale'
              : 'text-[#8C7A6B] hover:text-[#4A3F35] hover:bg-[#F4EFE6] hover:-translate-y-0.5'
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
