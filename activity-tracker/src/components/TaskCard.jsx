import React from 'react';
import { Clock, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export default function TaskCard({ task }) {
  const { toggleTaskStatus } = useTasks();

  const isCompleted = task.logged >= task.needed;
  const timeLeft = Math.max(0, task.needed - task.logged);
  const progress = Math.min(100, (task.logged / task.needed) * 100);

  const priorityColors = {
    'High': 'bg-red-50 text-red-600 border border-red-100',
    'Medium': 'bg-orange-50 text-orange-600 border border-orange-100',
    'Low': 'bg-gray-50 text-gray-500 border border-gray-100'
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-[#F4EFE6] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button onClick={() => toggleTaskStatus(task.id)} className={`mt-0.5 transition-colors ${isCompleted ? 'text-[#E89D71]' : 'text-gray-300 hover:text-[#E89D71]'}`}>
            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
          <div className="flex-1 w-full overflow-hidden">
            <h4 className={`font-semibold truncate ${isCompleted ? 'line-through text-gray-400' : 'text-[#4A3F35]'}`}>{task.title}</h4>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityColors[task.priority || 'Medium']}`}>
                {task.priority || 'Medium'}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#8C7A6B]">
                <Clock size={14} />
                <span>{timeLeft > 0 ? `${timeLeft}h left` : 'Completed'}</span>
              </div>
              {!isCompleted && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#8C7A6B]">
                  <CalendarIcon size={14} />
                  <span>{task.date}</span>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full bg-[#F4EFE6] rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${isCompleted ? 'bg-gray-400' : 'bg-[#E89D71]'}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] mt-1.5 font-medium text-gray-400">
              <span>{task.logged}h logged</span>
              <span>{task.needed}h total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
