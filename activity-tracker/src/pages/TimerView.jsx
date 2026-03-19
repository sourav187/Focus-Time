import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CalendarDays, Flame, ListTodo, LaptopMinimalCheck, CheckCircle2, Circle, AlertCircle, Lock, Settings, Coffee, Zap } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { triggerGoalConfetti } from '../utils/confettiHelper';
import GoalModal from '../components/GoalModal';

export default function TimerView() {
  const {
    tasks,
    logFocusToTask,
    addFocusTime,
    todayStr,
    todayFocus,
    todaySessions,
    incrementSessions,
    currentStreak,
    dailyGoalMinutes,
    setDailyGoalMinutes,
    isGoalSet,
    setIsGoalSet,
    isLoading,
    timerSettings,
    setTimerSettings,
    timerMode,
    setTimerMode,
    completedSessions,
    setCompletedSessions
  } = useTasks();

  const [filterDate, setFilterDate] = useState(todayStr);
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [timeLeft, setTimeLeft] = useState(timerSettings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calculations & Progress
  const totalFocusMinutes = Math.round(todayFocus * 60);
  const progressRatio = dailyGoalMinutes > 0 ? Math.min(1, totalFocusMinutes / dailyGoalMinutes) : 0;
  const progressPercentage = (progressRatio * 100).toFixed(0);

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

  // Confetti Trigger (Once per day)
  useEffect(() => {
    if (totalFocusMinutes >= dailyGoalMinutes && dailyGoalMinutes > 0) {
      const storageKey = `confetti_shown_${todayStr}`;
      const hasShown = localStorage.getItem(storageKey);

      if (!hasShown) {
        triggerGoalConfetti();
        localStorage.setItem(storageKey, 'true');
      }
    }
  }, [totalFocusMinutes, dailyGoalMinutes, todayStr]);

  const availableTasks = tasks.filter(t =>
    t.logged < t.needed &&
    t.date === filterDate &&
    (filterPriority === 'All' || t.priority === filterPriority)
  );

  // Auto-clear selection if filter removes the selected task
  useEffect(() => {
    if (selectedTaskId && !availableTasks.find(t => t.id === selectedTaskId)) {
      setSelectedTaskId('');
    }
  }, [availableTasks, selectedTaskId]);
  // Update timeLeft when mode or settings change (if not active)
  useEffect(() => {
    if (!isActive) {
      const duration = timerMode === 'focus' 
        ? timerSettings.focusDuration 
        : (timerMode === 'shortBreak' ? timerSettings.shortBreakDuration : timerSettings.longBreakDuration);
      setTimeLeft(duration * 60);
    }
  }, [timerMode, timerSettings.focusDuration, timerSettings.shortBreakDuration, timerSettings.longBreakDuration, isActive]);

  const handleSessionComplete = () => {
    setIsActive(false);
    
    if (timerMode === 'focus') {
      // Focus session complete
      if (sessionStartTime) {
        const elapsedHours = (Date.now() - sessionStartTime) / (1000 * 3600);
        const minutesToAdd = Math.min(timerSettings.focusDuration, elapsedHours * 60);
        
        addFocusTime(minutesToAdd / 60);
        if (selectedTaskId) {
          logFocusToTask(selectedTaskId, minutesToAdd / 60);
        }
        incrementSessions();
        setCompletedSessions(prev => prev + 1);
      }
      
      // Select next break mode
      const nextMode = (completedSessions + 1) % timerSettings.sessionsBeforeLongBreak === 0 
        ? 'longBreak' 
        : 'shortBreak';
      setTimerMode(nextMode);
      
      const nextDuration = nextMode === 'shortBreak' ? timerSettings.shortBreakDuration : timerSettings.longBreakDuration;
      setTimeLeft(nextDuration * 60);
      
      triggerGoalConfetti(); 
    } else {
      // Break session complete
      setTimerMode('focus');
      setTimeLeft(timerSettings.focusDuration * 60);
    }
    setSessionStartTime(null);
  };

  // Timer Interval
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive) {
      // Start or Resume
      setSessionStartTime(Date.now());
      setIsActive(true);
    } else {
      // Pause
      setIsActive(false);
      if (timerMode === 'focus' && sessionStartTime) {
        const elapsedHours = (Date.now() - sessionStartTime) / (1000 * 3600);
        addFocusTime(elapsedHours);
        if (selectedTaskId) {
          logFocusToTask(selectedTaskId, elapsedHours);
        }
      }
      setSessionStartTime(null);
    }
  };

  const resetTimer = () => {
    // Log current progress before reset if in focus mode
    if (isActive && timerMode === 'focus' && sessionStartTime) {
      const elapsedHours = (Date.now() - sessionStartTime) / (1000 * 3600);
      addFocusTime(elapsedHours);
      if (selectedTaskId) {
        logFocusToTask(selectedTaskId, elapsedHours);
      }
    }
    
    setIsActive(false);
    setSessionStartTime(null);
    const duration = timerMode === 'focus' 
      ? timerSettings.focusDuration 
      : (timerMode === 'shortBreak' ? timerSettings.shortBreakDuration : timerSettings.longBreakDuration);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatFocusTime = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <main className="max-w-5xl mx-auto px-8 py-8 flex flex-col items-center gap-12 w-full animate-in fade-in zoom-in-95 duration-500">
      {/* Daily Goal Section */}
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] transition-all duration-300 min-h-[160px] flex flex-col justify-center">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E89D71]"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[#8C7A6B] font-bold text-sm uppercase tracking-wider">Today's Goal 🎯</h3>
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
                    <h2 className="text-3xl font-bold text-[#4A3F35] tracking-tight">
                      <span className="text-[#E89D71]">{totalFocusMinutes}</span>
                      <span className="text-[#8C7A6B] mx-2 text-2xl">/</span>
                      <span>{dailyGoalMinutes}</span>
                      <span className="text-sm font-medium text-[#8C7A6B] ml-2">min</span>
                    </h2>
                    <div className="text-[#8C7A6B] opacity-40" title="Goal locked for today">
                      <Lock size={18} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsGoalModalOpen(true)}
                    className="bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#E89D71] font-bold py-2.5 px-6 rounded-2xl transition-all flex items-center gap-2 border-2 border-dashed border-[#E89D71] border-opacity-30"
                  >
                    <Clock size={18} />
                    <span>Add Daily Goal</span>
                  </button>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#E89D71] opacity-70">{progressPercentage}%</span>
              </div>
            </div>

            <div className={`relative w-full h-4 bg-[#F4EFE6] rounded-full overflow-hidden transition-all duration-500 ${totalFocusMinutes >= dailyGoalMinutes && isGoalSet ? 'ring-2 ring-green-500' : ''}`}>
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out 
                  ${totalFocusMinutes >= dailyGoalMinutes && isGoalSet
                    ? 'bg-gradient-to-r from-green-500 to-[#10B981] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                    : 'bg-gradient-to-r from-[#E89D71] to-[#f4a261]'}`}
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

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoalMinutes={dailyGoalMinutes}
        onSave={(mins) => {
          setDailyGoalMinutes(mins);
          setIsGoalSet(true);
        }}
      />

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
            <div className="flex justify-between items-center pt-2 border-t border-[#F4EFE6]">
              <label className="text-xs font-medium text-[#8C7A6B]">Long break after (sessions)</label>
              <input 
                type="number" 
                value={timerSettings.sessionsBeforeLongBreak} 
                onChange={(e) => setTimerSettings({...timerSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 1})}
                className="w-16 bg-[#FAF8F5] border-transparent border-2 focus:border-[#4A3F35] rounded-lg p-1 text-center font-bold text-sm outline-none"
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
                : 'bg-[#E89D71] text-white hover:bg-[#d68b60] hover:shadow-md hover:-translate-y-0.5'
              }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className={!isGoalSet ? "" : "ml-1"} />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
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

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-4">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl text-[#8C7A6B]">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm text-[#8C7A6B] font-medium">Today's Focus</p>
            <p className="text-2xl font-semibold mt-1">{formatFocusTime(todayFocus)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl text-[#8C7A6B]">
            <CalendarDays size={28} />
          </div>
          <div>
            <p className="text-sm text-[#8C7A6B] font-medium">Sessions</p>
            <p className="text-2xl font-semibold mt-1">{todaySessions}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-[#e89d711a] rounded-2xl text-[#E89D71]">
            <Flame size={28} />
          </div>
          <div>
            <p className="text-sm text-[#8C7A6B] font-medium">Current Streak</p>
            <p className="text-2xl font-semibold mt-1">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</p>
          </div>
        </div>
      </div>

      {/* 3-Part Task Selector (Moved below Stats Grid) */}
      <div className="w-full max-w-4xl bg-white p-6 md:p-8 rounded-[2rem] border border-[#F4EFE6] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-4 mb-20 animate-in slide-in-from-bottom-4 duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mb-8 w-full">
          <div className="flex items-center justify-center gap-4 text-center">
            <div className="p-3 bg-gradient-to-br from-[#FAF8F5] to-[#F4EFE6] rounded-[1rem] text-[#E89D71] shadow-inner shrink-0">
              <LaptopMinimalCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#4A3F35]">Focus Session Setup</h3>
              <p className="text-sm font-medium text-[#8C7A6B] mt-0.5">Filter and select the task you want to log time against.</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-[#FAF8F5] to-[#F4EFE6] rounded-[1rem] text-[#E89D71] shadow-inner shrink-0">
              <LaptopMinimalCheck size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full items-start bg-gradient-to-br from-[#FAF8F5]/80 to-transparent p-6 rounded-3xl border border-[#F4EFE6]/50">
          <div className="md:col-span-1 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full px-5 py-3.5 rounded-[1.25rem] border-2 border-transparent bg-white focus:border-[#E89D71]/30 focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold text-[#4A3F35] shadow-sm hover:shadow-md cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">
              Priority
            </label>
            <div className="relative">
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="w-full pl-5 pr-10 py-3.5 rounded-[1.25rem] border-2 border-transparent bg-white focus:border-[#E89D71]/30 focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold appearance-none text-[#4A3F35] shadow-sm hover:shadow-md cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">⚪ Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8C7A6B]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">
              Select Task
            </label>
            <div className="relative">
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className={`w-full pl-5 pr-10 py-3.5 rounded-[1.25rem] border-2 ${availableTasks.length === 0 ? 'bg-gray-50/50 border-gray-100 text-gray-400' : 'bg-white border-transparent focus:border-[#E89D71]/30 text-[#E89D71] shadow-sm hover:shadow-md'} font-bold focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all appearance-none cursor-pointer`}
                disabled={availableTasks.length === 0}
              >
                <option value="">{availableTasks.length === 0 ? 'No tasks found...' : 'Choose a task from list...'}</option>
                {availableTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.needed - t.logged}h left)</option>
                ))}
              </select>
              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 ${availableTasks.length === 0 ? 'text-gray-400' : 'text-[#E89D71]'}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
