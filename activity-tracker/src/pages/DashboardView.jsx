import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { triggerGoalConfetti } from '../utils/confettiHelper';
import { soundHelper } from '../utils/soundHelper';
import GoalModal from '../components/dashboard/GoalModal';
import AddTaskModal from '../components/tasks/AddTaskModal';

// Modular Components
import GoalProgressCard from '../components/dashboard/GoalProgressCard';
import TimerDisplay from '../components/dashboard/TimerDisplay';
import QuickStatsOverview from '../components/dashboard/QuickStatsOverview';
import SessionSetup from '../components/dashboard/SessionSetup';

export default function DashboardView() {
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
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calculations & Progress
  const totalFocusMinutes = Math.round(todayFocus * 60);
  const progressRatio = dailyGoalMinutes > 0 ? Math.min(1, totalFocusMinutes / dailyGoalMinutes) : 0;
  const progressPercentage = (progressRatio * 100).toFixed(0);

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
  }, [timerMode, timerSettings, isActive]);

  const handleSessionComplete = () => {
    setIsActive(false);
    soundHelper.playCompletion();

    if (timerMode === 'focus') {
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

      const nextMode = (completedSessions + 1) % timerSettings.sessionsBeforeLongBreak === 0
        ? 'longBreak'
        : 'shortBreak';
      setTimerMode(nextMode);

      const nextDuration = nextMode === 'shortBreak' ? timerSettings.shortBreakDuration : timerSettings.longBreakDuration;
      setTimeLeft(nextDuration * 60);

      triggerGoalConfetti();
    } else {
      setTimerMode('focus');
      setTimeLeft(timerSettings.focusDuration * 60);
    }
    setSessionStartTime(null);
  };

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
      soundHelper.playNotification();
      setSessionStartTime(Date.now());
      setIsActive(true);
    } else {
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
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col items-center gap-12 w-full animate-in fade-in zoom-in-95 duration-500">

      <GoalProgressCard
        isLoading={isLoading}
        isGoalSet={isGoalSet}
        totalFocusMinutes={totalFocusMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
        progressPercentage={progressPercentage}
        onAddGoal={() => setIsGoalModalOpen(true)}
      />

      <TimerDisplay
        timerMode={timerMode}
        setTimerMode={setTimerMode}
        timeLeft={timeLeft}
        formatTime={formatTime}
        isActive={isActive}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        isGoalSet={isGoalSet}
        completedSessions={completedSessions}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        timerSettings={timerSettings}
        setTimerSettings={setTimerSettings}
      />

      <QuickStatsOverview
        focusTimeStr={formatFocusTime(todayFocus)}
        sessions={todaySessions}
        streak={currentStreak}
      />

      <SessionSetup
        onAddTask={() => setIsAddTaskModalOpen(true)}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        selectedTaskId={selectedTaskId}
        setSelectedTaskId={setSelectedTaskId}
        availableTasks={availableTasks}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoalMinutes={dailyGoalMinutes}
        onSave={(mins) => {
          setDailyGoalMinutes(mins);
          setIsGoalSet(true);
        }}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </main>
  );
}
