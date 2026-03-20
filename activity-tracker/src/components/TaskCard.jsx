import React, { useState } from 'react';
import { CheckCircle2, Circle, Briefcase, User, Pencil, Trash2, AlertTriangle, GripVertical, Check } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

// --- Style Maps ---
const PRIORITY = {
  High:   { dot: 'bg-rose-500',   bar: 'bg-rose-400',   text: 'text-rose-600',   label: 'bg-rose-50 text-rose-600 border-rose-200',  top: 'bg-rose-400' },
  Medium: { dot: 'bg-amber-400',  bar: 'bg-amber-400',  text: 'text-amber-600',  label: 'bg-amber-50 text-amber-600 border-amber-200', top: 'bg-amber-300' },
  Low:    { dot: 'bg-teal-400',   bar: 'bg-teal-400',   text: 'text-teal-600',   label: 'bg-teal-50 text-teal-600 border-teal-200',   top: 'bg-teal-300'  },
};

const CATEGORY = {
  Office:   { icon: Briefcase, style: 'text-blue-400' },
  Personal: { icon: User,      style: 'text-violet-400' },
};

const fmtMins = (hours) => {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// --- Confirm Modal ---
function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onCancel, icon: Icon }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {Icon && (
          <div className={`p-3 rounded-2xl ${confirmClass.includes('emerald') ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <Icon size={26} className={confirmClass.includes('emerald') ? 'text-emerald-500' : 'text-red-500'} />
          </div>
        )}
        <div className="text-center">
          <h4 className="text-base font-bold text-gray-800">{title}</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-all ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Task Card ---
export default function TaskCard({ task, onEdit, isOverdue }) {
  const { toggleTaskStatus, deleteTask } = useTasks();
  const [confirm, setConfirm] = useState(null); // null | 'complete' | 'delete'

  const priority  = task.priority || 'Medium';
  const category  = task.category || 'Personal';
  const pStyle    = PRIORITY[priority]  || PRIORITY.Medium;
  const catMeta   = CATEGORY[category]  || CATEGORY.Personal;
  const CatIcon   = catMeta.icon;

  const isCompleted = task.logged >= task.needed;
  const neededMins  = Math.round((task.needed || 0) * 60);
  const loggedMins  = Math.round((task.logged || 0) * 60);
  const leftMins    = Math.max(0, neededMins - loggedMins);
  const progress    = neededMins > 0 ? Math.min(100, (loggedMins / neededMins) * 100) : 0;

  // Format date for overdue display
  const dateObj = new Date(task.date + 'T12:00:00'); // Use noon to avoid TZ shift
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
  };

  return (
    <>
      {/* Card */}
      <div
        draggable={!isCompleted}
        onDragStart={handleDragStart}
        className={`group relative bg-white rounded-2xl border transition-all duration-200
          ${isCompleted
            ? 'opacity-50 border-gray-100 shadow-none'
            : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
          }`}
      >
        {/* Priority top stripe — slightly thicker for better presence */}
        <div className={`h-[5px] rounded-t-2xl ${isCompleted ? 'bg-gray-200' : pStyle.top}`} />

        <div className="px-3.5 py-3">
          {/* Row 1 — Drag + Title + Actions */}
          <div className="flex items-center gap-2">
            {/* Drag handle — only visible on hover, hidden when completed */}
            {!isCompleted && (
              <div className="text-gray-200 group-hover:text-gray-400 cursor-grab shrink-0 transition-colors">
                <GripVertical size={13} />
              </div>
            )}

            {/* Title — high contrast */}
            <p className={`flex-1 min-w-0 text-sm font-bold truncate leading-relaxed
              ${isCompleted ? 'line-through text-gray-400' : 'text-slate-900'}`}>
              {task.title}
            </p>

            {/* Action buttons — visible on hover (or always on mobile) */}
            <div className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200
              ${isCompleted ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
              {/* Complete */}
              <button
                title="Mark complete"
                onClick={() => setConfirm('complete')}
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-300 hover:text-emerald-500 transition-all"
              >
                <Check size={12} strokeWidth={2.5} />
              </button>
              {/* Edit */}
              <button
                title="Edit"
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-300 hover:text-indigo-500 transition-all"
              >
                <Pencil size={12} />
              </button>
              {/* Delete */}
              <button
                title="Delete"
                onClick={() => setConfirm('delete')}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Row 2 — Priority + Category + Time */}
          <div className="flex items-center gap-2 mt-2 ml-5">
            {/* Priority — prominent */}
            <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${pStyle.label}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
              {priority}
            </span>

            {/* Category — subtle, icon only + text */}
            <span className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold ${catMeta.style}`}>
              <CatIcon size={11} strokeWidth={2.5} />
              {category}
            </span>

            {/* Overdue Date — only if overdue and not completed */}
            {isOverdue && !isCompleted && (
              <>
                <div className="w-1 h-1 rounded-full bg-gray-300 mx-0.5" />
                <span className="shrink-0 text-[10px] font-bold text-rose-500/80 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100/50">
                  {dateStr}
                </span>
              </>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Time remaining — darker for legibility */}
            {!isCompleted && (
              <span className="shrink-0 text-[10px] font-bold text-gray-500">
                {leftMins > 0 ? `${fmtMins(task.needed - task.logged)} left` : 'Done'}
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <CheckCircle2 size={11} /> Done
              </span>
            )}
          </div>

          {/* Row 3 — Progress bar + counter */}
          <div className="mt-2.5 ml-5">
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-400' : pStyle.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-gray-600 font-bold tracking-tight">
              {loggedMins} / {neededMins} min
            </p>
          </div>
        </div>
      </div>

      {/* Complete Confirmation */}
      {confirm === 'complete' && (
        <ConfirmModal
          icon={Check}
          title="Mark as completed?"
          message={`"${task.title}" will be marked as done.`}
          confirmLabel="Complete"
          confirmClass="bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-200"
          onConfirm={() => { toggleTaskStatus(task.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Delete Confirmation */}
      {confirm === 'delete' && (
        <ConfirmModal
          icon={AlertTriangle}
          title="Delete task?"
          message={`"${task.title}" will be permanently removed.`}
          confirmLabel="Delete"
          confirmClass="bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200"
          onConfirm={() => { deleteTask(task.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
