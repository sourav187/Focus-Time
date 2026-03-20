import React from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, Circle, Briefcase, User, Pencil, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskCard({ task, onEdit }) {
  const { toggleTaskStatus, deleteTask } = useTasks();

  const isCompleted = task.logged >= task.needed;
  const timeLeft = Math.max(0, task.needed - task.logged);
  const progress = Math.min(100, (task.logged / task.needed) * 100);

  const priorityColors = {
    'High': 'bg-red-50 text-red-600 border border-red-100',
    'Medium': 'bg-orange-50 text-orange-600 border border-orange-100',
    'Low': 'bg-gray-50 text-gray-500 border border-gray-100'
  };

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const categoryStyles = {
    'Office': {
      bg: 'bg-blue-50/50 text-blue-600 border-blue-100',
      icon: Briefcase
    },
    'Personal': {
      bg: 'bg-fuchsia-50/50 text-fuchsia-600 border-fuchsia-100',
      icon: User
    }
  };

  const catStyle = categoryStyles[task.category] || categoryStyles['Personal'];
  const CategoryIcon = catStyle.icon;

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-[#F4EFE6] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 flex-1">
          <button onClick={() => toggleTaskStatus(task.id)} className={`mt-0.5 transition-colors ${isCompleted ? 'text-[#E89D71]' : 'text-gray-300 hover:text-[#E89D71]'}`}>
            {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
          <div className="flex-1 w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h4 className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-gray-400' : 'text-[#4A3F35]'}`}>{task.title}</h4>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#E89D71] transition-all shrink-0"
                >
                  <Pencil size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this task?')) deleteTask(task.id); }}
                  className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 whitespace-nowrap overflow-x-auto no-scrollbar">
              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${priorityColors[task.priority || 'Medium']}`}>
                {task.priority || 'Medium'}
              </span>
              <div className={`shrink-0 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${catStyle.bg}`}>
                <CategoryIcon size={12} />
                <span>{task.category || 'Personal'}</span>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-[#8C7A6B]">
                <Clock size={12} />
                <span>{timeLeft > 0 ? `${formatTime(timeLeft)} left` : 'Done'}</span>
              </div>
              {!isCompleted && (
                <div className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-[#8C7A6B]">
                  <CalendarIcon size={12} />
                  <span>{task.date}</span>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-[#F4EFE6] rounded-full h-1 overflow-hidden">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ease-out ${isCompleted ? 'bg-gray-400' : 'bg-[#E89D71]'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] mt-1 font-medium text-gray-400 italic">
              <span>{formatTime(task.logged)} logged</span>
              <span>{formatTime(task.needed)} total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
