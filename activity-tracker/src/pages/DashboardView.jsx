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
    setCompletedSessions,
    // Global Timer State
    timeLeft, setTimeLeft, isActive, setIsActive, 
    sessionStartTime, setSessionStartTime, 
    selectedTaskId, setSelectedTaskId,
    syncTimerSettings
  } = useTasks();

  const [filterDate, setFilterDate] = useState(todayStr);
  const [filterPriority, setFilterPriority] = useState('All');

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calculations & Progress
  const totalFocusMinutes = isNaN(Number(todayFocus)) ? 0 : Math.round(todayFocus * 60);
  const safeGoal = isNaN(Number(dailyGoalMinutes)) ? 0 : dailyGoalMinutes;
  const progressRatio = safeGoal > 0 ? Math.min(1, totalFocusMinutes / safeGoal) : 0;
  const progressPercentage = isNaN(Number(progressRatio)) ? 0 : (progressRatio * 100).toFixed(0);

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
    if (selectedTaskId && !availableTasks.find(t => String(t.id) === String(selectedTaskId))) {
      setSelectedTaskId('');
    }
  }, [availableTasks, selectedTaskId, setSelectedTaskId]);

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
  }, [isActive, timeLeft, setTimeLeft]);

  // Track current state in a ref to use in the unmount cleanup without triggering re-runs
  const unmountRef = React.useRef({ isActive, timerMode, sessionStartTime, selectedTaskId });
  useEffect(() => {
    unmountRef.current = { isActive, timerMode, sessionStartTime, selectedTaskId };
  }, [isActive, timerMode, sessionStartTime, selectedTaskId]);

  // AUTO-PAUSE LOGIC: Truly only on UNMOUNT
  useEffect(() => {
    return () => {
      const { isActive: wasActive, timerMode: mode, sessionStartTime: start, selectedTaskId: taskId } = unmountRef.current;
      if (wasActive) {
        setIsActive(false);
        if (mode === 'focus' && start) {
          const elapsedHours = (Date.now() - start) / (1000 * 3600);
          addFocusTime(elapsedHours);
          if (taskId) {
            logFocusToTask(taskId, elapsedHours);
          }
        }
        setSessionStartTime(null);
      }
    };
  }, []); // Empty dependency array ensures this cleanup ONLY runs on unmount

  const toggleTimer = () => {
    if (!isActive) {
      soundHelper.playNotification();
      setSessionStartTime(Date.now());
      setIsActive(true);
    } else {
      // Pause manually
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
        setIsSettingsOpen={(open) => {
          if (!open) syncTimerSettings(timerSettings);
          setIsSettingsOpen(open);
        }}
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
