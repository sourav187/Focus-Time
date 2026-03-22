import React, { useState } from 'react';
import { CheckCircle2, Circle, Briefcase, User, Pencil, Trash2, AlertTriangle, GripVertical, Check } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

// --- Style Maps ---
const PRIORITY = {
  High: { 
    dot: 'bg-[var(--p-high-text)]', 
    bar: 'bg-[var(--p-high-text)]', 
    text: 'text-[var(--p-high-text)]', 
    label: 'bg-[var(--p-high-bg)] text-[var(--p-high-text)] border-[var(--p-high-border)]', 
    top: 'bg-[var(--p-high-text)]' 
  },
  Medium: { 
    dot: 'bg-[var(--p-medium-text)]', 
    bar: 'bg-[var(--p-medium-text)]', 
    text: 'text-[var(--p-medium-text)]', 
    label: 'bg-[var(--p-medium-bg)] text-[var(--p-medium-text)] border-[var(--p-medium-border)]', 
    top: 'bg-[var(--p-medium-text)]' 
  },
  Low: { 
    dot: 'bg-[var(--p-low-text)]', 
    bar: 'bg-[var(--p-low-text)]', 
    text: 'text-[var(--p-low-text)]', 
    label: 'bg-[var(--p-low-bg)] text-[var(--p-low-text)] border-[var(--p-low-border)]', 
    top: 'bg-[var(--p-low-text)]' 
  },
};

const CATEGORY = {
  Office: { icon: Briefcase, style: 'text-blue-600 dark:text-blue-400' },
  Personal: { icon: User, style: 'text-violet-600 dark:text-violet-400' },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--app-card)] rounded-3xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200 border border-[var(--app-border)]"
        onClick={e => e.stopPropagation()}
      >
        {Icon && (
          <div className={`p-3 rounded-2xl ${confirmClass.includes('emerald') ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' : 'bg-red-50 dark:bg-red-950/30 text-red-500'}`}>
            <Icon size={26} strokeWidth={2.5} />
          </div>
        )}
        <div className="text-center">
          <h4 className="text-base font-bold text-[var(--app-text)]">{title}</h4>
          <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-[var(--app-bg)] text-[var(--app-text-muted)] font-bold text-sm hover:bg-[var(--app-border)] transition-all"
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

  const priority = task.priority || 'Medium';
  const category = task.category || 'Personal';
  const pStyle = PRIORITY[priority] || PRIORITY.Medium;
  const catMeta = CATEGORY[category] || CATEGORY.Personal;
  const CatIcon = catMeta.icon;

  const isCompleted = task.logged >= task.needed;
  const neededMins = Math.round((task.needed || 0) * 60);
  const loggedMins = Math.round((task.logged || 0) * 60);
  const leftMins = Math.max(0, neededMins - loggedMins);
  const progress = neededMins > 0 ? Math.min(100, (loggedMins / neededMins) * 100) : 0;

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
        className={`group relative bg-[var(--app-card)] rounded-2xl border transition-all duration-200
          ${isCompleted
            ? 'opacity-50 border-[var(--app-border)] shadow-none'
            : 'border-[var(--app-border)] shadow-sm hover:shadow-md hover:border-[var(--app-accent)]/30'
          }`}
      >
        {/* Priority top stripe */}
        <div className={`h-[5px] rounded-t-2xl ${isCompleted ? 'bg-gray-200 dark:bg-gray-700' : pStyle.top}`} />

        <div className="px-3.5 py-3">
          {/* Row 1 — Drag + Title + Actions */}
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <div className="text-[var(--app-border)] group-hover:text-[var(--app-text-muted)] cursor-grab shrink-0 transition-colors">
                <GripVertical size={13} />
              </div>
            )}

            <p className={`flex-1 min-w-0 text-sm font-bold truncate leading-relaxed
              ${isCompleted ? 'line-through text-[var(--app-text-muted)]' : 'text-[var(--app-text)]'}`}>
              {task.title}
            </p>

            <div className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200
              ${isCompleted ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                title="Mark complete"
                onClick={() => setConfirm('complete')}
                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-[var(--app-text-muted)] hover:text-emerald-500 transition-all"
              >
                <Check size={12} strokeWidth={2.5} />
              </button>
              <button
                title="Edit"
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-[var(--app-text-muted)] hover:text-indigo-500 transition-all"
              >
                <Pencil size={12} />
              </button>
              <button
                title="Delete"
                onClick={() => setConfirm('delete')}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-[var(--app-text-muted)] hover:text-red-500 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Row 2 — Priority + Category + Time */}
          <div className="flex items-center gap-2 mt-2 ml-5">
            <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${pStyle.label}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
              {priority}
            </span>

            <span className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold ${catMeta.style}`}>
              <CatIcon size={11} strokeWidth={2.5} />
              {category}
            </span>

            {isOverdue && !isCompleted && (
              <>
                <div className="w-1 h-1 rounded-full bg-[var(--app-border)] mx-0.5" />
                <span className="shrink-0 text-[10px] font-bold text-[var(--p-high-text)] bg-[var(--p-high-bg)] px-1.5 py-0.5 rounded-md border border-[var(--p-high-border)]">
                  {dateStr}
                </span>
              </>
            )}

            <div className="flex-1" />

            {!isCompleted && (
              <span className="shrink-0 text-[10px] font-bold text-[var(--app-text-muted)]">
                {leftMins > 0 ? `${fmtMins(task.needed - task.logged)} left` : 'Done'}
              </span>
            )}
            {isCompleted && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={11} /> Done
              </span>
            )}
          </div>

          {/* Row 3 — Progress bar + counter */}
          <div className="mt-2.5 ml-5">
            <div className="w-full h-1 bg-[var(--app-bg)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-emerald-400' : pStyle.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-[var(--app-text-muted)] font-bold tracking-tight">
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
