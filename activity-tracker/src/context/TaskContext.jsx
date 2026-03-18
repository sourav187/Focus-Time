import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children, user }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error.message);
      } else {
        // Map data from DB to frontend model
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
      setIsLoading(false);
    };

    fetchTasks();
  }, [user]);

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

  const addLoggedTime = async (taskId, minutes) => {
    if (!user) return;
    const hours = Number((minutes / 60).toFixed(2));
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newLogged = task.logged + hours;

    // Optimistic local update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, logged: newLogged } : t
    ));

    // DB update
    const { error } = await supabase
      .from('tasks')
      .update({ logged: newLogged })
      .eq('id', taskId);
      
    if (error) console.error("Error adding time:", error.message);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTaskStatus, addLoggedTime, todayStr, isLoading }}>
      {children}
    </TaskContext.Provider>
  );
};
