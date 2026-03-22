import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { taskService, statsService } from '../services/dataService';

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

  // Get local YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayStr = getLocalDate();

  // Initialization
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const fetchedTasks = await taskService.fetchTasks(user);
        setTasks(fetchedTasks || []);

        const stats = await statsService.fetchDailyStats(user, todayStr);
        
        if (stats.today) {
          const t = stats.today;
          setTodayFocus(Number(t.total_focus_hours || t.focus || 0));
          setTodaySessions(t.sessions_count || t.sessions || 0);
          const goal = Number(t.daily_goal_minutes || t.goal || 0);
          setDailyGoalMinutes(goal);
          setIsGoalSet(goal > 0);
          if (t.settings) setTimerSettings(t.settings);
        } else {
          setTodayFocus(0);
          setTodaySessions(0);
          setDailyGoalMinutes(0);
          setIsGoalSet(false);
        }

        if (stats.history) {
          setDailyHistory(stats.history);
          setCurrentStreak(statsService.calculateStreak(stats.history));
          const total = stats.history.reduce((acc, row) => acc + Number(row.total_focus_hours), 0);
          setTotalFocusTime(Number(total.toFixed(2)));
        }

        // Sync ref
        lastSyncedStats.current = {
          focus: Number(todayFocus),
          sessions: todaySessions,
          goal: dailyGoalMinutes,
          isGoalSet: isGoalSet
        };
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [user, todayStr]);

  // Sync effect
  useEffect(() => {
    if (isLoading) return;
    const hasChanged =
      todayFocus !== lastSyncedStats.current.focus ||
      todaySessions !== lastSyncedStats.current.sessions ||
      dailyGoalMinutes !== lastSyncedStats.current.goal ||
      isGoalSet !== lastSyncedStats.current.isGoalSet;

    if (!hasChanged) return;

    const statsToSync = {
      focus: todayFocus,
      sessions: todaySessions,
      goal: dailyGoalMinutes,
      isGoalSet,
      settings: timerSettings
    };

    statsService.syncStats(user, todayStr, statsToSync).then(() => {
      lastSyncedStats.current = { focus: todayFocus, sessions: todaySessions, goal: dailyGoalMinutes, isGoalSet: isGoalSet };
    });
  }, [todayFocus, todaySessions, dailyGoalMinutes, isGoalSet, timerSettings, user, todayStr, isLoading]);

  // Actions
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
    await updateTask(taskId, { logged: newLogged });
  };

  const addFocusTime = (hoursToAdd) => {
    if (!hoursToAdd || hoursToAdd <= 0) return;
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
      dailyHistory
    }}>
      {children}
    </TaskContext.Provider>
  );
};
