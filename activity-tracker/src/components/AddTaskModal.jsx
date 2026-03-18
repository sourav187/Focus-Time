import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';

export default function AddTaskModal({ isOpen, onClose }) {
  const { addTask, todayStr } = useTasks();
  const [newTask, setNewTask] = useState({ title: '', date: todayStr, needed: '', priority: 'Medium' });

  if (!isOpen) return null;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.needed || !newTask.date) return;
    
    addTask(newTask);
    setNewTask({ title: '', date: todayStr, needed: '', priority: 'Medium' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#4A3F35]/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-[#F4EFE6] animate-in slide-in-from-bottom-4 duration-300">
        <h3 className="text-xl font-bold mb-6 text-[#4A3F35]">Add New Task</h3>
        <form onSubmit={handleAddTask} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2 ml-1">Task Name</label>
            <input 
              type="text" 
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              placeholder="e.g. Finish Essay" 
              className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[#F4EFE6] bg-[#FAF8F5]/80 focus:bg-white focus:outline-none focus:border-[#E89D71]/30 focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold text-[#4A3F35]"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2 ml-1">Date</label>
              <input 
                type="date"
                value={newTask.date}
                onChange={e => setNewTask({...newTask, date: e.target.value})}
                className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[#F4EFE6] bg-[#FAF8F5]/80 focus:bg-white focus:outline-none focus:border-[#E89D71]/30 focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold text-[#4A3F35]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2 ml-1">Hours Needed</label>
              <input 
                type="number" 
                min="0.5"
                step="0.5"
                value={newTask.needed}
                onChange={e => setNewTask({...newTask, needed: e.target.value})}
                placeholder="e.g. 5" 
                className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[#F4EFE6] bg-[#FAF8F5]/80 focus:bg-white focus:outline-none focus:border-[#E89D71]/30 focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold text-[#4A3F35]"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2 ml-1">Priority</label>
            <select 
              value={newTask.priority}
              onChange={e => setNewTask({...newTask, priority: e.target.value})}
              className="w-full px-5 py-4 rounded-[1.25rem] border-2 border-[#F4EFE6] bg-[#FAF8F5]/80 focus:bg-white focus:outline-none focus:border-[#E89D71]/30 focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold appearance-none text-[#4A3F35]"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 rounded-[1.25rem] font-bold text-[#8C7A6B] hover:bg-[#FAF8F5] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 rounded-[1.25rem] font-bold bg-[#E89D71] text-white hover:bg-[#d68b60] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
