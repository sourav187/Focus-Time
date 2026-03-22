import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar, Clock, ChevronRight, Briefcase, User, Flag, Plus, Check } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export default function AddTaskModal({ isOpen, onClose, editingTask = null }) {
  const { addTask, updateTask, todayStr } = useTasks();

  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('one-time');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [timeNeeded, setTimeNeeded] = useState(60); // in minutes

  // Populate form if editing, or reset for new task
  useEffect(() => {
    if (editingTask && isOpen) {
      setTaskName(editingTask.title);
      setTaskType(editingTask.is_multi_day ? 'multi-day' : 'one-time');
      setDate(editingTask.date);
      setEndDate(editingTask.end_date || editingTask.date);
      setTimeNeeded(editingTask.needed * 60); // Convert hours to minutes for UI
      setPriority(editingTask.priority || 'Medium');
      setCategory(editingTask.category || 'Personal');
    } else if (isOpen) {
      setTaskName('');
      setTaskType('one-time');
      setDate(todayStr);
      setEndDate(todayStr);
      setTimeNeeded(60);
      setPriority('Medium');
      setCategory('Personal');
    }
  }, [editingTask, isOpen, todayStr]);

  const plannedDuration = useMemo(() => {
    if (taskType !== 'multi-day') return 1;
    const start = new Date(date);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [date, endDate, taskType]);

  const totalPlannedHours = useMemo(() => {
    const hours = (timeNeeded / 60);
    if (taskType === 'one-time') return hours.toFixed(1);
    return (hours * plannedDuration).toFixed(1);
  }, [taskType, timeNeeded, plannedDuration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    if (editingTask) {
      const taskData = {
        title: taskName,
        date: date,
        needed: timeNeeded / 60,
        priority,
        category,
        is_multi_day: taskType === 'multi-day',
        start_date: date,
        end_date: taskType === 'multi-day' ? endDate : date
      };
      await updateTask(editingTask.id, taskData);
    } else {
      if (taskType === 'multi-day') {
        const tasksToCreate = [];
        const start = new Date(date + 'T12:00:00');
        const end = new Date(endDate + 'T12:00:00');
        // Generate a pseudo-UUID string that is safe in all environments
        const groupId = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const currentDayStr = d.toISOString().split('T')[0];
          tasksToCreate.push({
            title: taskName,
            date: currentDayStr,
            needed: timeNeeded, // Passing minutes; Context will divide by 60
            priority,
            category,
            is_multi_day: true,
            start_date: date,
            end_date: endDate,
            group_id: groupId
          });
        }
        await addTask(tasksToCreate);
      } else {
        await addTask({
          title: taskName,
          date: date,
          needed: timeNeeded, // Passing minutes; Context will divide by 60
          priority,
          category,
          is_multi_day: false,
          start_date: date,
          end_date: date
        });
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-[var(--app-card)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-[var(--app-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--app-border)] flex justify-between items-center bg-gradient-to-r from-[var(--app-card)] to-[var(--app-bg)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--app-text)]">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <p className="text-sm font-medium text-[var(--app-text-muted)]">
              {editingTask ? 'Modify your focus session details.' : 'Plan your focus sessions effectively.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-[var(--app-border)] text-[var(--app-text-muted)] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto max-h-[85vh]">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">Task Name</label>
            <input
              autoFocus
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[var(--app-bg)] border-2 border-transparent focus:border-[var(--app-accent)]/30 focus:bg-[var(--app-card)] focus:outline-none focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all text-sm font-semibold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">Task Type</label>
            <div className="flex p-1 bg-[var(--app-bg)] rounded-2xl border border-[var(--app-border)]">
              <button
                type="button"
                onClick={() => setTaskType('one-time')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${taskType === 'one-time' ? 'bg-[var(--app-card)] text-[var(--app-accent)] shadow-sm' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-card)]/50'}`}
              >
                <Calendar size={12} />
                One-time Task
              </button>
              <button
                type="button"
                onClick={() => setTaskType('multi-day')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${taskType === 'multi-day' ? 'bg-[var(--app-card)] text-[var(--app-accent)] shadow-sm' : 'text-[var(--app-text-muted)] hover:bg-[var(--app-card)]/50'}`}
              >
                <ChevronRight size={12} />
                Multi-day Task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">Category</label>
              <div className="flex p-1 bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setCategory('Office')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${category === 'Office' ? 'bg-[var(--app-card)] text-[var(--app-text)] shadow-sm' : 'text-[var(--app-text-muted)]'}`}
                >
                  <Briefcase size={12} />
                  Office
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('Personal')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${category === 'Personal' ? 'bg-[var(--app-card)] text-[var(--app-text)] shadow-sm' : 'text-[var(--app-text-muted)]'}`}
                >
                  <User size={12} />
                  Personal
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">Priority</label>
              <div className="flex p-1 bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)]">
                {(['Low', 'Medium', 'High']).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${priority === p ? 'bg-[var(--app-card)] text-[var(--app-text)] shadow-sm' : 'text-[var(--app-text-muted)]'}`}
                  >
                    <Flag size={12} className={priority === p ? (p === 'High' ? 'text-red-400' : p === 'Medium' ? 'text-yellow-400' : 'text-blue-400') : ''} />
                    {p.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[var(--app-bg)]/50 pt-2 px-4 pb-4 rounded-2xl border border-[var(--app-border)] space-y-4">
            {taskType === 'one-time' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-accent)]" size={14} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] outline-none shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">Duration (min)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-accent)]" size={14} />
                    <input
                      type="number"
                      value={timeNeeded}
                      onChange={(e) => setTimeNeeded(parseInt(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">Start Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--app-text-muted)]">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] outline-none shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--app-card)] rounded-xl border border-[var(--app-border)] shadow-sm">
                  <p className="text-[11px] font-bold text-[var(--app-text)]">
                    {plannedDuration}d • <span className="text-[var(--app-accent)]">{totalPlannedHours}h total</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={timeNeeded}
                      onChange={(e) => setTimeNeeded(parseInt(e.target.value) || 0)}
                      className="w-12 bg-transparent border-b-2 border-[var(--app-accent)] text-[var(--app-text)] text-xs font-bold text-center"
                    />
                    <span className="text-[8px] font-bold text-[var(--app-text-muted)]">min/day</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--app-bg)] text-[var(--app-text-muted)] font-bold hover:bg-[var(--app-border)] transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 rounded-xl bg-[var(--app-accent)] text-white font-bold shadow-lg shadow-[var(--app-accent)]/10 hover:bg-[#d68b60] hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {editingTask ? <Check size={18} /> : <Plus size={18} />}
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
