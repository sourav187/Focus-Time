import React from 'react';
import { Plus, ListTodo } from 'lucide-react';
import TaskCard from './TaskCard';

export default function DayDetailPanel({
  selectedDate,
  setSelectedDate,
  tasks,
  onEdit,
  onAddTask
}) {
  if (!selectedDate) return null;

  const dayTasks = tasks.filter(t => t.date === selectedDate);
  const formattedSelected = new Date(selectedDate + 'T00:00:00');

  return (
    <div className="w-full lg:w-96 flex flex-col gap-4 animate-in slide-in-from-right fade-in duration-500">
      <div className="bg-slate-700 rounded-[2rem] p-5 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            {formattedSelected.toLocaleDateString(undefined, { weekday: 'long' })}
          </p>
          <h3 className="text-white text-xl font-bold mt-0.5">
            {formattedSelected.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <button
          onClick={() => setSelectedDate(null)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <Plus size={18} className="rotate-45" />
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-1">
        {dayTasks.length > 0 ? (
          dayTasks.map(t => (
            <TaskCard key={t.id} task={t} onEdit={onEdit} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4">
              <ListTodo size={28} className="text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No tasks this day</p>
            <button
              onClick={onAddTask}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all"
            >
              + Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
