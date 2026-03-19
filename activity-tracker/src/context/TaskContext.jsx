import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children, user }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayFocus, setTodayFocus] = useState(0); // in hours
  const [todaySessions, setTodaySessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(1);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(0); 
  const [isGoalSet, setIsGoalSet] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0); 
  
  // Timer Settings & Mode
  const [timerSettings, setTimerSettings] = useState({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4
  });
  const [timerMode, setTimerMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [completedSessions, setCompletedSessions] = useState(0);

  const lastSyncedStats = useRef({ focus: 0, sessions: 0, goal: 0, isGoalSet: false });

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to calculate streak from history
  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;

    // history is already ordered by date DESC from Supabase
    const dates = history.map(h => h.stats_date);
    let streak = 0;
    let checkDate = new Date(); // Start with today

    // If the latest log isn't today OR yesterday, the streak is broken
    const latestLog = dates[0];
    const checkStrToday = checkDate.toISOString().split('T')[0];

    checkDate.setDate(checkDate.getDate() - 1);
    const checkStrYesterday = checkDate.toISOString().split('T')[0];

    if (latestLog !== checkStrToday && latestLog !== checkStrYesterday) {
      return 0;
    }

    // Reset checkDate to the latest log date to start counting correctly
    checkDate = new Date(latestLog);

    for (const logDate of dates) {
      const expectedStr = checkDate.toISOString().split('T')[0];
      if (logDate === expectedStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Step 1: Initialize stats (Supabase OR Guest Mode)
  useEffect(() => {
    const fetchDailyStats = async () => {
      if (!user) {
        // GUEST MODE: Load from localStorage
        const savedStats = localStorage.getItem(`focus_stats_guest_${todayStr}`);
        if (savedStats) {
          const { focus, sessions, goal, isGoalSet: savedIsGoalSet, settings } = JSON.parse(savedStats);
          setTodayFocus(focus || 0);
          setTodaySessions(sessions || 0);
          setDailyGoalMinutes(goal || 0);
          setIsGoalSet(!!savedIsGoalSet);
          if (settings) setTimerSettings(settings);
        } else {
          setTodayFocus(0);
          setTodaySessions(0);
          setDailyGoalMinutes(0);
          setIsGoalSet(false);
        }
        setCurrentStreak(1);
        return;
      }

      // AUTH MODE: Fetch from Supabase
      // 1. Fetch Today's Stats
      const { data: todayData } = await supabase
        .from('daily_stats')
        .select('total_focus_hours, sessions_count, daily_goal_minutes, goal_achieved')
        .eq('user_id', user.id)
        .eq('stats_date', todayStr)
        .single();

      if (todayData) {
        setTodayFocus(Number(todayData.total_focus_hours) || 0);
        setTodaySessions(todayData.sessions_count || 0);
        if (todayData.daily_goal_minutes !== null && todayData.daily_goal_minutes !== undefined) {
          setDailyGoalMinutes(Number(todayData.daily_goal_minutes));
          setIsGoalSet(true); 
        } else {
          setDailyGoalMinutes(0);
          setIsGoalSet(false);
        }
      } else {
        setTodayFocus(0);
        setTodaySessions(0);
        setDailyGoalMinutes(0);
        setIsGoalSet(false);
      }

      // 2. Fetch History for Streak and Totals
      const { data: historyData } = await supabase
        .from('daily_stats')
        .select('stats_date, total_focus_hours')
        .eq('user_id', user.id)
        .order('stats_date', { ascending: false });

      if (historyData && historyData.length > 0) {
        setCurrentStreak(calculateStreak(historyData));
        const total = historyData.reduce((acc, row) => acc + Number(row.total_focus_hours), 0);
        setTotalFocusTime(Number(total.toFixed(2)));
      } else {
        setCurrentStreak(0);
        setTotalFocusTime(0);
      }

      // 3. Initialize sync ref with what we just fetched to avoid immediate re-sync
      lastSyncedStats.current = {
        focus: Number(todayData?.total_focus_hours || 0),
        sessions: todayData?.sessions_count || 0,
        goal: Number(todayData?.daily_goal_minutes || 0),
        isGoalSet: (todayData?.daily_goal_minutes !== null && todayData?.daily_goal_minutes !== undefined)
      };
    };

    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error.message);
      } else {
        const mappedTasks = data.map(t => ({
          id: t.id,
          title: t.title,
          date: t.task_date,
          needed: Number(t.needed),
          logged: Number(t.logged),
          priority: t.priority
        }));
        setTasks(mappedTasks);
      }
    };

    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchTasks(), fetchDailyStats()]);
      setIsLoading(false);
    };

    init();
  }, [user, todayStr]);

  // Step 2: Sync stats (Supabase OR Guest Mode)
  useEffect(() => {
    if (isLoading) return; // Wait until initial fetch finishes

    if (user) {
      // Check if data has actually changed compared to what's in DB/last synced
      const hasChanged = 
        todayFocus !== lastSyncedStats.current.focus ||
        todaySessions !== lastSyncedStats.current.sessions ||
        dailyGoalMinutes !== lastSyncedStats.current.goal ||
        isGoalSet !== lastSyncedStats.current.isGoalSet;

      if (!hasChanged) return;

      // AUTH MODE: Sync to DB
      if (isGoalSet || todayFocus > 0 || todaySessions > 0) {
        const syncStats = async () => {
          await supabase
            .from('daily_stats')
            .upsert({
              user_id: user.id,
              stats_date: todayStr,
              total_focus_hours: todayFocus,
              sessions_count: todaySessions,
              daily_goal_minutes: dailyGoalMinutes || null,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, stats_date' });
          
          // Update ref after successful sync
          lastSyncedStats.current = { focus: todayFocus, sessions: todaySessions, goal: dailyGoalMinutes, isGoalSet: isGoalSet };
        };
        syncStats();
      }
    } else {
      // GUEST MODE: Sync to localStorage
      localStorage.setItem(`focus_stats_guest_${todayStr}`, JSON.stringify({
        focus: todayFocus,
        sessions: todaySessions,
        goal: dailyGoalMinutes,
        isGoalSet: isGoalSet,
        settings: timerSettings
      }));
    }
  }, [todayFocus, todaySessions, dailyGoalMinutes, isGoalSet, timerSettings, user, todayStr, isLoading]);

  const addTask = async (newTask) => {
    if (!user) return alert("Please login to save tasks.");

    const dbTask = {
      user_id: user.id,
      title: newTask.title,
      task_date: newTask.date,
      needed: Number(newTask.needed),
      logged: 0,
      priority: newTask.priority || 'Medium'
    };

    const { data, error } = await supabase.from('tasks').insert([dbTask]).select();

    if (error) {
      console.error("Error adding task:", error.message);
    } else if (data && data.length > 0) {
      const t = data[0];
      setTasks(prev => [{
        id: t.id,
        title: t.title,
        date: t.task_date,
        needed: Number(t.needed),
        logged: Number(t.logged),
        priority: t.priority
      }, ...prev]);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCompleted = task.logged >= task.needed;
    const newLogged = isCompleted ? 0 : task.needed;

    // Optimistic local update
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, logged: newLogged } : t
    ));

    // DB update
    const { error } = await supabase
      .from('tasks')
      .update({ logged: newLogged })
      .eq('id', taskId);

    if (error) console.error("Error toggling status:", error.message);
  };

  const addFocusTime = (hoursToAdd) => {
    if (!hoursToAdd || hoursToAdd <= 0) return;
    const hours = Number(hoursToAdd.toFixed(4));
    setTodayFocus(prev => Number((prev + hours).toFixed(4)));
  };

  const logFocusToTask = async (taskId, hoursToAdd) => {
    if (!user || !taskId) return;

    const hours = Number(hoursToAdd.toFixed(4));
    if (hours <= 0) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newLogged = Number((task.logged + hours).toFixed(4));

    // Update local task state
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, logged: newLogged } : t
    ));

    // Sync with DB
    const { error } = await supabase
      .from('tasks')
      .update({ logged: newLogged })
      .eq('id', taskId);

    if (error) console.error("Error syncing task time:", error.message);
  };

  const incrementSessions = () => {
    setTodaySessions(prev => prev + 1);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      toggleTaskStatus,
      logFocusToTask,
      addFocusTime,
      todayStr,
      isLoading,
      todayFocus,
      todaySessions,
      currentStreak,
      dailyGoalMinutes,
      setDailyGoalMinutes,
      isGoalSet,
      setIsGoalSet,
      totalFocusTime,
      timerSettings,
      setTimerSettings,
      timerMode,
      setTimerMode,
      completedSessions,
      setCompletedSessions,
      incrementSessions
    }}>
      {children}
    </TaskContext.Provider>
  );
};
