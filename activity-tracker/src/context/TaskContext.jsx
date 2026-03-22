import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { taskService, statsService, profileService } from '../services/dataService';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children, user }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayFocus, setTodayFocus] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(1);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(0);
  const [isGoalSet, setIsGoalSet] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [dailyHistory, setDailyHistory] = useState([]);

  // Timer Settings & Mode
  const [timerSettings, setTimerSettings] = useState({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  });
  const [timerMode, setTimerMode] = useState('focus');
  const [completedSessions, setCompletedSessions] = useState(0);

  const lastSyncedStats = useRef({ focus: 0, sessions: 0, goal: 0, isGoalSet: false });
  const lastSyncedSettings = useRef(null);

  // Get local YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // Get memoized local YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  }, []);

  // Initialization
  useEffect(() => {
    let isCanceled = false;

    const initData = async () => {
      setIsLoading(true);
      const withTimeout = (p, ms = 6000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("Timeout")), ms))]);

      try {
        const [fetchedTasks, profile, stats] = await Promise.all([
          withTimeout(taskService.fetchTasks(user)).catch(() => []),
          withTimeout(profileService.fetchProfile(user)).catch(() => ({ settings: null, theme: 'light' })),
          withTimeout(statsService.fetchDailyStats(user, todayStr)).catch(() => ({ today: null, history: [] }))
        ]);

        if (isCanceled) return;

        // 1. Tasks
        setTasks(fetchedTasks || []);

        // 2. Profile Settings
        if (profile?.settings) {
          setTimerSettings(profile.settings);
          lastSyncedSettings.current = JSON.stringify(profile.settings);
        }

        // 3. Stats
        if (stats?.today) {
          const t = stats.today;
          const focus = Number(t.total_focus_hours || t.focus || 0);
          const sessions = Number(t.sessions_count || t.sessions || 0);
          const goal = Number(t.daily_goal_minutes || t.goal || 0);
          
          setTodayFocus(isNaN(focus) ? 0 : focus);
          setTodaySessions(isNaN(sessions) ? 0 : sessions);
          setDailyGoalMinutes(isNaN(goal) ? 0 : goal);
          setIsGoalSet(goal > 0);

          lastSyncedStats.current = { focus: isNaN(focus) ? 0 : focus, sessions: isNaN(sessions) ? 0 : sessions, goal, isGoalSet: goal > 0 };
        } else {
          setTodayFocus(0); setTodaySessions(0); setDailyGoalMinutes(0); setIsGoalSet(false);
          lastSyncedStats.current = { focus: 0, sessions: 0, goal: 0, isGoalSet: false };
        }

        if (stats?.history && Array.isArray(stats.history)) {
          setDailyHistory(stats.history);
          setCurrentStreak(statsService.calculateStreak(stats.history));
          
          const totalRaw = stats.history.reduce((acc, row) => {
            const val = Number(row.total_focus_hours || 0);
            return acc + (isNaN(val) ? 0 : val);
          }, 0);
          setTotalFocusTime(isNaN(totalRaw) ? 0 : Number(totalRaw.toFixed(2)));
        }
      } catch (err) {
        // Silently handle top-level errors as we have per-fetch catch/timeout
      } finally {
        if (!isCanceled) setIsLoading(false);
      }
    };

    initData();
    return () => { isCanceled = true; };
  }, [user, todayStr]);

  // Sync Stats Effect (Reduced frequency)
  useEffect(() => {
    if (isLoading) return;

    // 1. Sync Daily Stats
    const statsChanged =
      todayFocus !== lastSyncedStats.current.focus ||
      todaySessions !== lastSyncedStats.current.sessions ||
      dailyGoalMinutes !== lastSyncedStats.current.goal ||
      isGoalSet !== lastSyncedStats.current.isGoalSet;

    if (statsChanged) {
      const statsToSync = {
        focus: todayFocus,
        sessions: todaySessions,
        goal: dailyGoalMinutes,
        isGoalSet
      };

      statsService.syncStats(user, todayStr, statsToSync).then(() => {
        lastSyncedStats.current = { focus: todayFocus, sessions: todaySessions, goal: dailyGoalMinutes, isGoalSet };
      });
    }
  }, [todayFocus, todaySessions, dailyGoalMinutes, isGoalSet, user, todayStr, isLoading]);

  const syncTimerSettings = async (settings) => {
    const settingsStr = JSON.stringify(settings);
    if (settingsStr === lastSyncedSettings.current) return;

    try {
      await profileService.updateProfile(user, { settings });
      lastSyncedSettings.current = settingsStr;
    } catch (err) {
      console.error("Error syncing profile settings:", err);
    }
  };

  // Actions
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Initial timeLeft based on settings
  useEffect(() => {
    if (timeLeft === 0 && !isActive) {
      const duration = timerMode === 'focus'
        ? timerSettings.focusDuration
        : (timerMode === 'shortBreak' ? timerSettings.shortBreakDuration : timerSettings.longBreakDuration);
      setTimeLeft(duration * 60);
    }
  }, [timerSettings, timerMode, isActive, timeLeft]);

  const addTask = async (taskOrTasks) => {
    try {
      const taskArr = Array.isArray(taskOrTasks) ? taskOrTasks : [taskOrTasks];
      const added = await taskService.addTask(user, taskArr);
      setTasks(prev => [...added, ...prev]);
    } catch (err) {
      console.error("Error adding tasks:", err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      await taskService.updateTask(user, taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(user, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const isCompleted = task.logged >= task.needed;
    const newLogged = isCompleted ? 0 : task.needed;
    const hoursDiff = newLogged - task.logged;

    await updateTask(taskId, { logged: newLogged });

    // Sync Stats
    if (task.date === todayStr) {
      setTodayFocus(prev => Number((prev + hoursDiff).toFixed(4)));
    } else {
      const targetDate = task.date;
      setDailyHistory(prev => {
        const existing = prev.find(h => h.stats_date === targetDate);
        if (existing) {
          const updatedHistory = prev.map(h => h.stats_date === targetDate
            ? { ...h, total_focus_hours: Number((Number(h.total_focus_hours || 0) + hoursDiff).toFixed(4)) }
            : h
          );
          
          const updatedRecord = updatedHistory.find(h => h.stats_date === targetDate);
          statsService.syncStats(user, targetDate, {
            focus: updatedRecord.total_focus_hours,
            sessions: updatedRecord.sessions_count || updatedRecord.sessions || 0,
            goal: updatedRecord.daily_goal_minutes || updatedRecord.goal || 0,
            isGoalSet: (updatedRecord.daily_goal_minutes || updatedRecord.goal) > 0
          });
          return updatedHistory;
        } else {
          const newRecord = { stats_date: targetDate, total_focus_hours: hoursDiff };
          statsService.syncStats(user, targetDate, {
            focus: hoursDiff,
            sessions: 0,
            goal: 0,
            isGoalSet: false
          });
          return [newRecord, ...prev].sort((a,b) => b.stats_date.localeCompare(a.stats_date));
        }
      });
    }
  };

  const addFocusTime = (hoursToAdd) => {
    if (!hoursToAdd) return;
    setTodayFocus(prev => Number((prev + hoursToAdd).toFixed(4)));
  };

  const logFocusToTask = async (taskId, hoursToAdd) => {
    if (!taskId || hoursToAdd <= 0) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newLogged = Number((task.logged + hoursToAdd).toFixed(4));
    await updateTask(taskId, { logged: newLogged });
  };

  const incrementSessions = () => setTodaySessions(prev => prev + 1);

  return (
    <TaskContext.Provider value={{
      tasks, addTask, updateTask, toggleTaskStatus, deleteTask,
      addFocusTime, logFocusToTask, todayStr, isLoading,
      todayFocus, todaySessions, currentStreak, dailyGoalMinutes,
      setDailyGoalMinutes, isGoalSet, setIsGoalSet, totalFocusTime,
      timerSettings, setTimerSettings, timerMode, setTimerMode,
      completedSessions, setCompletedSessions, incrementSessions,
      dailyHistory,
      timeLeft, setTimeLeft, isActive, setIsActive,
      sessionStartTime, setSessionStartTime,
      selectedTaskId, setSelectedTaskId,
      syncTimerSettings
    }}>
      {children}
    </TaskContext.Provider>
  );
};
