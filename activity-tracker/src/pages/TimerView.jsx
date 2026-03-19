import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CalendarDays, Flame, ListTodo, LaptopMinimalCheck } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TimerView() {
  const { tasks, logFocusToTask, addFocusTime, todayStr, todayFocus, todaySessions, incrementSessions, currentStreak } = useTasks();

  const [filterDate, setFilterDate] = useState(todayStr);
  const [filterPriority, setFilterPriority] = useState('All');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Constants
  const dailyGoalHours = 5;
  const focusProgress = Math.min(100, (todayFocus / dailyGoalHours) * 100);

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

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Final log on completion (Log the full 25 mins)
      const fullSessionHours = 25 / 60;
      addFocusTime(fullSessionHours);
      if (selectedTaskId) {
        logFocusToTask(selectedTaskId, fullSessionHours);
      }
      setSessionStartTime(null);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, selectedTaskId, logFocusToTask, addFocusTime]);

  // Handle page refresh/close persistence
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive && sessionStartTime) {
        const elapsedHours = (Date.now() - sessionStartTime) / (1000 * 3600);
        addFocusTime(elapsedHours);
        if (selectedTaskId) {
          logFocusToTask(selectedTaskId, elapsedHours);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, selectedTaskId, sessionStartTime, addFocusTime, logFocusToTask]);

  const toggleTimer = () => {
    if (!isActive) {
      // Starting or Resuming
      if (timeLeft === 25 * 60) {
        incrementSessions();
      }
      setSessionStartTime(Date.now());
      setIsActive(true);
    } else {
      // Pausing: Calculate and log the actual elapsed time
      setIsActive(false);
      if (sessionStartTime) {
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
    if (isActive && sessionStartTime) {
      const elapsedHours = (Date.now() - sessionStartTime) / (1000 * 3600);
      addFocusTime(elapsedHours);
      if (selectedTaskId) {
        logFocusToTask(selectedTaskId, elapsedHours);
      }
    }
    setIsActive(false);
    setTimeLeft(25 * 60);
    setSessionStartTime(null);
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
      {/* Daily Goal */}
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] transition-transform hover:-translate-y-1 duration-300">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-sm text-[#8C7A6B] font-medium mb-1">Daily Goal</p>
            <h2 className="text-lg font-semibold">{todayFocus.toFixed(2)} / {dailyGoalHours} hours</h2>
          </div>
          <span className="text-sm font-medium text-[#E89D71]">{Math.round(focusProgress)}%</span>
        </div>
        <div className="w-full bg-[#F4EFE6] rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#E89D71] h-2.5 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${focusProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Timer UI */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="text-[8rem] leading-none font-medium tracking-tighter text-[#4A3F35] drop-shadow-sm tabular-nums">
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 shadow-sm active:scale-95 ${isActive
              ? 'bg-white text-[#4A3F35] border border-[#E5E5E5] hover:bg-gray-50'
              : 'bg-[#E89D71] text-white hover:bg-[#d68b60] hover:shadow-md hover:-translate-y-0.5'
              }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            {isActive ? 'Pause' : 'Start Focus'}
          </button>
          <button
            onClick={resetTimer}
            className="p-4 rounded-full bg-white text-[#8C7A6B] border border-[#F4EFE6] hover:text-[#4A3F35] hover:bg-[#F4EFE6] hover:-translate-y-0.5 transition-all duration-300 shadow-sm active:scale-95"
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
