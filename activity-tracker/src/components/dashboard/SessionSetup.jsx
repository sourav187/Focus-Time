import React from 'react';
import { Plus } from 'lucide-react';

export default function SessionSetup({ 
  onAddTask, 
  filterDate, 
  setFilterDate, 
  filterPriority, 
  setFilterPriority, 
  selectedTaskId, 
  setSelectedTaskId, 
  availableTasks 
}) {
  return (
    <div className="w-full bg-[var(--app-card)] p-6 md:p-8 rounded-[2rem] border border-[var(--app-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-4 mb-20 animate-in slide-in-from-bottom-4 duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mb-8 w-full">
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="p-3 bg-[var(--app-accent-muted)] rounded-[1rem] text-[var(--app-accent)] shadow-inner shrink-0 cursor-pointer hover:bg-[var(--app-border)] transition-all group"
            onClick={onAddTask}
            title="Add New Task"
          >
            <Plus size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--app-text)]">Focus Session Setup</h3>
            <p className="text-sm font-medium text-[var(--app-text-muted)] mt-0.5">Filter and select the task you want to log time against.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start bg-[var(--app-bg)] p-6 rounded-3xl border border-[var(--app-border)]">
        <div className="md:col-span-1 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-5 py-3.5 rounded-[1.25rem] border-2 border-transparent bg-[var(--app-card)] focus:border-[var(--app-accent)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold text-[var(--app-text)] shadow-sm hover:shadow-md cursor-pointer"
            />
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">
            Priority
          </label>
          <div className="relative">
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full pl-5 pr-10 py-3.5 rounded-[1.25rem] border-2 border-transparent bg-[var(--app-card)] focus:border-[var(--app-accent)]/30 focus:outline-none focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all font-semibold appearance-none text-[var(--app-text)] shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">⚪ Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--app-text-muted)]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-muted)] ml-1">
            Select Task
          </label>
          <div className="relative">
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className={`w-full pl-5 pr-10 py-3.5 rounded-[1.25rem] border-2 ${availableTasks.length === 0 ? 'bg-gray-50/50 border-gray-100 text-gray-400' : 'bg-[var(--app-card)] border-transparent focus:border-[var(--app-accent)]/30 text-[var(--app-accent)] shadow-sm hover:shadow-md'} font-bold focus:outline-none focus:ring-4 focus:ring-[var(--app-accent)]/10 transition-all appearance-none cursor-pointer`}
              disabled={availableTasks.length === 0}
            >
              <option value="">{availableTasks.length === 0 ? 'No tasks found...' : 'Choose a task from list...'}</option>
              {availableTasks.map(t => {
                const leftHours = Math.max(0, t.needed - t.logged);
                const totalMins = Math.round(leftHours * 60);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                return (
                  <option key={t.id} value={t.id}>{t.title} ({timeStr} left)</option>
                );
              })}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 ${availableTasks.length === 0 ? 'text-gray-400' : 'text-[var(--app-accent)]'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
