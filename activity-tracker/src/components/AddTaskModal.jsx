import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, ChevronRight, Briefcase, User, Flag, Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function AddTaskModal({ isOpen, onClose }) {
  const { addTask } = useTasks();

  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('one-time'); // 'one-time' | 'multi-day'
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('Medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeNeeded, setTimeNeeded] = useState(120); // in minutes

  const plannedDuration = useMemo(() => {
    if (taskType !== 'multi-day') return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate, taskType]);

  const totalPlannedHours = useMemo(() => {
    if (taskType === 'one-time') return (timeNeeded / 60).toFixed(1);
    return ((timeNeeded * plannedDuration) / 60).toFixed(1);
  }, [taskType, timeNeeded, plannedDuration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    if (taskType === 'one-time') {
      await addTask({
        title: taskName,
        date: date,
        needed: timeNeeded,
        priority,
        category
      });
    } else {
      // Multi-day: Create multiple tasks
      const tasks = [];
      const start = new Date(startDate);
      for (let i = 0; i < plannedDuration; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        tasks.push({
          title: taskName,
          date: d.toISOString().split('T')[0],
          needed: timeNeeded,
          priority,
          category
        });
      }
      await addTask(tasks);
    }

    // Reset and Close
    setTaskName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#F4EFE6] flex justify-between items-center bg-gradient-to-r from-white to-[#FAF8F5]">
          <div>
            <h2 className="text-2xl font-bold text-[#4A3F35]">Create New Task</h2>
            <p className="text-sm font-medium text-[#8C7A6B]">Plan your focus sessions effectively.</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-[#F4EFE6] text-[#8C7A6B] transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto max-h-[85vh]">
          {/* Task Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">Task Name</label>
            <input
              autoFocus
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-[#FAF8F5] border-2 border-transparent focus:border-[#E89D71]/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all text-sm font-semibold text-[#4A3F35] placeholder:text-[#8C7A6B]/50"
              required
            />
          </div>

          {/* Task Type Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">Task Type</label>
            <div className="flex p-1 bg-[#FAF8F5] rounded-2xl border border-[#F4EFE6]">
              <button
                type="button"
                onClick={() => setTaskType('one-time')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${taskType === 'one-time' ? 'bg-white text-[#E89D71] shadow-sm' : 'text-[#8C7A6B] hover:bg-white/50'}`}
              >
                <Calendar size={12} />
                One-time Task
              </button>
              <button
                type="button"
                onClick={() => setTaskType('multi-day')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${taskType === 'multi-day' ? 'bg-white text-[#E89D71] shadow-sm' : 'text-[#8C7A6B] hover:bg-white/50'}`}
              >
                <ChevronRight size={12} />
                Multi-day Task
              </button>
            </div>
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">Category</label>
              <div className="flex p-1 bg-[#FAF8F5] rounded-xl border border-[#F4EFE6]">
                <button
                  type="button"
                  onClick={() => setCategory('Office')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${category === 'Office' ? 'bg-white text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B]'}`}
                >
                  <Briefcase size={12} />
                  Office
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('Personal')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${category === 'Personal' ? 'bg-white text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B]'}`}
                >
                  <User size={12} />
                  Personal
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">Priority</label>
              <div className="flex p-1 bg-[#FAF8F5] rounded-xl border border-[#F4EFE6]">
                <button
                  type="button"
                  onClick={() => setPriority('Low')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${priority === 'Low' ? 'bg-white text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B]'}`}
                >
                  <Flag size={12} className={priority === 'Low' ? 'text-blue-400' : ''} />
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('Medium')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${priority === 'Medium' ? 'bg-white text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B]'}`}
                >
                  <Flag size={12} className={priority === 'Medium' ? 'text-yellow-400' : ''} />
                  Mid
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('High')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${priority === 'High' ? 'bg-white text-[#4A3F35] shadow-sm' : 'text-[#8C7A6B]'}`}
                >
                  <Flag size={12} className={priority === 'High' ? 'text-red-400' : ''} />
                  High
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Date Fields */}
          <div className="bg-[#FAF8F5]/50 pt-2 px-4 pb-4 rounded-2xl border border-[#F4EFE6] space-y-4">
            {taskType === 'one-time' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E89D71]" size={14} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#F4EFE6] text-xs font-bold text-[#4A3F35] outline-none shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Min</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E89D71]" size={14} />
                    <input
                      type="number"
                      value={timeNeeded}
                      onChange={(e) => setTimeNeeded(parseInt(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#F4EFE6] text-xs font-bold text-[#4A3F35] outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Start</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4EFE6] text-xs font-bold text-[#4A3F35] outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">End</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#F4EFE6] text-xs font-bold text-[#4A3F35] outline-none shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#F4EFE6] shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#8C7A6B]">Daily Focus Time</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={timeNeeded}
                        onChange={(e) => setTimeNeeded(parseInt(e.target.value) || 0)}
                        className="w-14 bg-transparent border-b-2 border-[#E89D71] text-sm font-bold text-[#4A3F35] outline-none text-center"
                      />
                      <span className="text-[10px] font-bold text-[#8C7A6B]">min / day</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#B4A594]">Summary</p>
                    <p className="text-[11px] font-bold text-[#4A3F35] mt-0.5">
                      {plannedDuration}d • <span className="text-[#E89D71]">{totalPlannedHours}h total</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-[#FAF8F5] text-[#8C7A6B] font-bold hover:bg-[#F4EFE6] transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 px-4 rounded-xl bg-[#E89D71] text-white font-bold shadow-lg shadow-[#E89D71]/10 hover:bg-[#d68b60] hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={18} />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
