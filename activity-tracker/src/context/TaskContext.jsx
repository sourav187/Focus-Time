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

  // Get local YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const todayStr = getLocalDate();

  // Helper to calculate streak from history
  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;

    const toLocalStr = (date) => {
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      return localDate.toISOString().split('T')[0];
    };

    const dates = history.map(h => h.stats_date);
    let streak = 0;
    let checkDate = new Date(); // Start with today

    // Use local time for checks
    const checkStrToday = toLocalStr(checkDate);
    
    checkDate.setDate(checkDate.getDate() - 1);
    const checkStrYesterday = toLocalStr(checkDate);

    const latestLog = dates[0];

    if (latestLog !== checkStrToday && latestLog !== checkStrYesterday) {
      return 0;
    }

    // Reset checkDate to the latest log date to start counting correctly
    checkDate = new Date(latestLog);

    for (const logDate of dates) {
      const expectedStr = toLocalStr(checkDate);
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
          setCompletedSessions(0);
          setTimerMode('focus');
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
        setCompletedSessions(0);
        setTimerMode('focus');
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
        const savedTasks = localStorage.getItem('focus_tasks_guest');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks([]);
        }
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
          priority: t.priority,
          category: t.category,
          isMultiDay: !!t.is_multi_day,
          startDate: t.start_date,
          endDate: t.end_date,
          groupId: t.group_id
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

  const addTask = async (taskOrTasks) => {
    const tasksArray = Array.isArray(taskOrTasks) ? taskOrTasks : [taskOrTasks];
    
    const dbTasks = tasksArray.map(t => ({
      user_id: user?.id || 'guest',
      title: t.title,
      task_date: t.date,
      needed: Number(t.needed) / 60, // UI sends minutes, DB stores hours
      logged: 0,
      priority: t.priority || 'Medium',
      category: t.category || 'Personal',
      is_multi_day: t.is_multi_day || false,
      start_date: t.start_date || t.date,
      end_date: t.end_date || t.date,
      group_id: t.group_id || null
    }));

    if (!user) {
      // GUEST MODE: Save to state and localStorage
      const guestTasks = dbTasks.map((t, idx) => ({
        id: `guest-${Date.now()}-${idx}`,
        title: t.title,
        date: t.task_date,
        needed: t.needed,
        logged: 0,
        priority: t.priority,
        category: t.category,
        isMultiDay: t.is_multi_day,
        startDate: t.start_date,
        endDate: t.end_date,
        groupId: t.group_id
      }));
      
      const newTasks = [...guestTasks, ...tasks];
      setTasks(newTasks);
      localStorage.setItem('focus_tasks_guest', JSON.stringify(newTasks));
      return;
    }

    const { data, error } = await supabase.from('tasks').insert(dbTasks).select();

    if (error) {
      console.error("Error adding tasks:", error.message);
    } else if (data && data.length > 0) {
      const mapped = data.map(t => ({
        id: t.id,
        title: t.title,
        date: t.task_date,
        needed: Number(t.needed),
        logged: Number(t.logged),
        priority: t.priority,
        category: t.category,
        isMultiDay: !!t.is_multi_day,
        startDate: t.start_date,
        endDate: t.end_date,
        groupId: t.group_id
      }));
      setTasks(prev => [...mapped, ...prev]);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      if (user) {
        // Convert camelCase to snake_case for Supabase if needed
        const dbUpdates = { ...updates };
        if (updates.date) {
           dbUpdates.task_date = updates.date;
           delete dbUpdates.date;
        }

        const { error } = await supabase
          .from('tasks')
          .update(dbUpdates)
          .eq('id', taskId);

        if (error) throw error;
      } else {
        // Guest mode
        const savedTasks = localStorage.getItem('focus_tasks_guest');
        if (savedTasks) {
          const currentTasks = JSON.parse(savedTasks);
          const updatedTasks = currentTasks.map(t => 
            t.id === taskId ? { ...t, ...updates } : t
          );
          localStorage.setItem('focus_tasks_guest', JSON.stringify(updatedTasks));
        }
      }

      // Update local state instantly
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error.message);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCompleted = task.logged >= task.needed;
    const newLogged = isCompleted ? 0 : task.needed;

    // Optimistic local update
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, logged: newLogged } : t
    );
    setTasks(updatedTasks);

    if (!user) {
      // Guest mode — persist to localStorage
      localStorage.setItem('focus_tasks_guest', JSON.stringify(updatedTasks));
      return;
    }

    // Logged-in — sync to Supabase
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
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, logged: newLogged } : t
    );
    setTasks(updatedTasks);

    if (!user) {
      localStorage.setItem('focus_tasks_guest', JSON.stringify(updatedTasks));
      return;
    }

    // Sync with DB
    const { error } = await supabase
      .from('tasks')
      .update({ logged: newLogged })
      .eq('id', taskId);

    if (error) console.error("Error syncing task time:", error.message);
  };

  const deleteTask = async (taskId) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
        if (error) throw error;
      } else {
        // Guest mode
        const savedTasks = localStorage.getItem('focus_tasks_guest');
        if (savedTasks) {
          const currentTasks = JSON.parse(savedTasks);
          const updatedTasks = currentTasks.filter(t => t.id !== taskId);
          localStorage.setItem('focus_tasks_guest', JSON.stringify(updatedTasks));
        }
      }
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  };

  const incrementSessions = () => {
    setTodaySessions(prev => prev + 1);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      toggleTaskStatus,
      deleteTask,
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
