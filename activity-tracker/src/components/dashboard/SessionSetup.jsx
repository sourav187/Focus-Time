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
    <div className="w-full bg-white p-6 md:p-8 rounded-[2rem] border border-[#F4EFE6] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-4 mb-20 animate-in slide-in-from-bottom-4 duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mb-8 w-full">
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="p-3 bg-gradient-to-br from-[#FAF8F5] to-[#F4EFE6] rounded-[1rem] text-[#E89D71] shadow-inner shrink-0 cursor-pointer hover:bg-[#F4EFE6] transition-all group"
            onClick={onAddTask}
            title="Add New Task"
          >
            <Plus size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#4A3F35]">Focus Session Setup</h3>
            <p className="text-sm font-medium text-[#8C7A6B] mt-0.5">Filter and select the task you want to log time against.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start bg-gradient-to-br from-[#FAF8F5]/80 to-transparent p-6 rounded-3xl border border-[#F4EFE6]/50">
        <div className="md:col-span-1 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-5 py-3.5 rounded-[1.25rem] border-2 border-transparent bg-white focus:border-[#E89D71]/30 focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold text-[#4A3F35] shadow-sm hover:shadow-md cursor-pointer"
            />
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">
            Priority
          </label>
          <div className="relative">
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="w-full pl-5 pr-10 py-3.5 rounded-[1.25rem] border-2 border-transparent bg-white focus:border-[#E89D71]/30 focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all font-semibold appearance-none text-[#4A3F35] shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">⚪ Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8C7A6B]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] ml-1">
            Select Task
          </label>
          <div className="relative">
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className={`w-full pl-5 pr-10 py-3.5 rounded-[1.25rem] border-2 ${availableTasks.length === 0 ? 'bg-gray-50/50 border-gray-100 text-gray-400' : 'bg-white border-transparent focus:border-[#E89D71]/30 text-[#E89D71] shadow-sm hover:shadow-md'} font-bold focus:outline-none focus:ring-4 focus:ring-[#E89D71]/10 transition-all appearance-none cursor-pointer`}
              disabled={availableTasks.length === 0}
            >
              <option value="">{availableTasks.length === 0 ? 'No tasks found...' : 'Choose a task from list...'}</option>
              {availableTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.needed - t.logged}h left)</option>
              ))}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 ${availableTasks.length === 0 ? 'text-gray-400' : 'text-[#E89D71]'}`}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
