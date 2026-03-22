import { supabase } from '../utils/supabaseClient';

/**
 * Task and Focus Stats Service
 * Handles both Authenticated (Supabase) and Guest (LocalStorage) data persistence.
 */

// --- UTILS ---
const toLocalDateStr = (date = new Date()) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// --- TASK OPERATIONS ---
export const taskService = {
  fetchTasks: async (user) => {
    if (!user) {
      const saved = localStorage.getItem('focus_tasks_guest');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(t => ({
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
  },

  addTask: async (user, tasksArray) => {
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
      const savedTasks = JSON.parse(localStorage.getItem('focus_tasks_guest') || '[]');
      const newTasks = dbTasks.map((t, idx) => ({
        ...t,
        id: `guest-${Date.now()}-${idx}`,
        date: t.task_date,
        isMultiDay: t.is_multi_day,
        startDate: t.start_date,
        endDate: t.end_date,
        groupId: t.group_id
      }));
      const updated = [...newTasks, ...savedTasks];
      localStorage.setItem('focus_tasks_guest', JSON.stringify(updated));
      return newTasks;
    }

    const { data, error } = await supabase.from('tasks').insert(dbTasks).select();
    if (error) throw error;
    
    return data.map(t => ({
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
  },

  updateTask: async (user, taskId, updates) => {
    // Convert keys if needed
    const dbUpdates = { ...updates };
    if (updates.date) {
      dbUpdates.task_date = updates.date;
      delete dbUpdates.date;
    }

    if (user) {
      const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
      if (error) throw error;
    } else {
      const tasks = JSON.parse(localStorage.getItem('focus_tasks_guest') || '[]');
      const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      localStorage.setItem('focus_tasks_guest', JSON.stringify(updated));
    }
  },

  deleteTask: async (user, taskId) => {
    if (user) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    } else {
      const tasks = JSON.parse(localStorage.getItem('focus_tasks_guest') || '[]');
      const updated = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('focus_tasks_guest', JSON.stringify(updated));
    }
  }
};

// --- STATS OPERATIONS ---
export const statsService = {
  fetchDailyStats: async (user, todayStr) => {
    if (!user) {
      const guestHistory = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('focus_stats_guest_')) {
          const date = key.replace('focus_stats_guest_', '');
          const data = JSON.parse(localStorage.getItem(key));
          guestHistory.push({ stats_date: date, total_focus_hours: data.focus || 0, ...data });
        }
      }
      return {
        today: JSON.parse(localStorage.getItem(`focus_stats_guest_${todayStr}`) || 'null'),
        history: guestHistory.sort((a, b) => new Date(b.stats_date) - new Date(a.stats_date))
      };
    }

    const { data: todayData } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('stats_date', todayStr)
      .single();

    const { data: historyData } = await supabase
      .from('daily_stats')
      .select('stats_date, total_focus_hours')
      .eq('user_id', user.id)
      .order('stats_date', { ascending: false });

    return { today: todayData, history: historyData || [] };
  },

  syncStats: async (user, todayStr, stats) => {
    if (user) {
      await supabase.from('daily_stats').upsert({
        user_id: user.id,
        stats_date: todayStr,
        total_focus_hours: stats.focus,
        sessions_count: stats.sessions,
        daily_goal_minutes: stats.goal || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, stats_date' });
    } else {
      localStorage.setItem(`focus_stats_guest_${todayStr}`, JSON.stringify({
        focus: stats.focus,
        sessions: stats.sessions,
        goal: stats.goal,
        isGoalSet: stats.isGoalSet,
        settings: stats.settings
      }));
    }
  },

  calculateStreak: (history) => {
    if (!history || history.length === 0) return 0;
    const dates = history.map(h => h.stats_date);
    let streak = 0;
    let checkDate = new Date();
    
    const todayStr = toLocalDateStr(checkDate);
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = toLocalDateStr(checkDate);

    const latestLog = dates[0];
    if (latestLog !== todayStr && latestLog !== yesterdayStr) return 0;

    checkDate = new Date(latestLog);
    for (const logDate of dates) {
      if (logDate === toLocalDateStr(checkDate)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
};
