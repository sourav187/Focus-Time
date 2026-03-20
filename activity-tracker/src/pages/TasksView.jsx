import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ListTodo, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

export default function TasksView() {
  const { tasks, todayStr, updateTask } = useTasks();
  const today = new Date();
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [calMode, setCalMode] = useState('month'); // 'month' or 'week'
  const [navDate, setNavDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handlePrev = () => {
    if (calMode === 'month') {
      setNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setNavDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  };

  const handleNext = () => {
    if (calMode === 'month') {
      setNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setNavDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  };

  // Helper to format date as YYYY-MM-DD
  const formatDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };


  // Map a drop category name to a concrete YYYY-MM-DD date
  const getDateForCategory = (categoryName) => {
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    switch (categoryName) {
      case 'Today': return formatDate(base);
      case 'Tomorrow': { const d = new Date(base); d.setDate(d.getDate() + 1); return formatDate(d); }
      case 'This Week': { const d = new Date(base); d.setDate(d.getDate() + 3); return formatDate(d); }
      case 'This Month': { const d = new Date(base); d.setDate(d.getDate() + 10); return formatDate(d); }
      case 'Later': { const d = new Date(base); d.setDate(d.getDate() + 35); return formatDate(d); }
      default: return todayStr;
    }
  };

  const handleDrop = async (e, categoryName) => {
    e.preventDefault();
    setDragOverCategory(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const newDate = getDateForCategory(categoryName);
    await updateTask(taskId, { date: newDate });
  };

  const categorizeTask = (task) => {
    const [y, m, d] = task.date.split('-');
    const taskDate = new Date(y, m - 1, d);
    const isCompleted = task.logged >= task.needed;
    
    // Reset time for strictly day calculation based on today
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = taskDate.getTime() - currentDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If it's overdue and completed, hide it entirely (return null)
    if (diffDays < 0 && isCompleted) return null;
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    // Let's bucket within next 7 days as "This Week"
    if (diffDays <= 7) return 'This Week';
    // Let's bucket within 30 days as "This Month"
    if (diffDays <= 30) return 'This Month';
    return 'Later';
  };

  const categories = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'This Month', 'Later'];
  
  const categorizedTasks = categories.reduce((acc, cat) => {
    // List view remains a full overview of all tasks
    acc[cat] = tasks.filter(t => categorizeTask(t) === cat);
    return acc;
  }, {});

  const renderCategoryList = (categoryName) => {
    const list = categorizedTasks[categoryName];
    if (list.length === 0 && categoryName !== 'Today' && categoryName !== 'Tomorrow') return null;
    const isOver = dragOverCategory === categoryName;
    const canDrop = categoryName === 'Today' || categoryName === 'Tomorrow';

    return (
      <section
        key={categoryName}
        onDragOver={canDrop ? (e) => { e.preventDefault(); setDragOverCategory(categoryName); } : undefined}
        onDragLeave={canDrop ? (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCategory(null); } : undefined}
        onDrop={canDrop ? (e) => handleDrop(e, categoryName) : undefined}
        className={`rounded-2xl px-2 -mx-2 transition-all duration-200 ${isOver ? 'bg-indigo-50/80 ring-2 ring-indigo-300 ring-dashed py-2' : ''}`}
      >
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 
          ${categoryName === 'Overdue' ? 'text-red-500' : 'text-[#4A3F35]'}`}>
          {categoryName === 'Overdue' && <AlertCircle size={18} />}
          {categoryName}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border 
            ${categoryName === 'Today' || categoryName === 'Tomorrow' ? 'bg-[#FAF8F5] text-[#E89D71] border-[#F4EFE6]' : 'bg-[#FAF8F5] text-[#8C7A6B] border-[#F4EFE6]'}`}>
            {list.length}
          </span>
          {isOver && <span className="text-xs font-semibold text-indigo-500 animate-pulse ml-1">↓ Drop here</span>}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={handleEdit} 
              isOverdue={categoryName === 'Overdue'} 
            />
          ))}
          {list.length === 0 && (categoryName === 'Today' || categoryName === 'Tomorrow') && (
            <p className="text-sm text-gray-400 italic py-4">No tasks planned for {categoryName.toLowerCase()}.</p>
          )}
        </div>
      </section>
    );
  };

  const priorityColors = {
    'High': 'bg-red-50 text-red-600 border border-red-100',
    'Medium': 'bg-orange-50 text-orange-600 border border-orange-100',
    'Low': 'bg-gray-50 text-gray-500 border border-gray-100'
  };

  // Calendar logic based on navDate
  const year = navDate.getFullYear();
  const month = navDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const calendarCells = [];
  if (calMode === 'month') {
    for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);
  } else {
    // Week view: Find start of week (Sunday)
    const startOfWeek = new Date(navDate);
    startOfWeek.setDate(navDate.getDate() - navDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      calendarCells.push(d);
    }
  }

  const getWeekRangeTitle = () => {
    const start = new Date(calendarCells[0]);
    const end = new Date(calendarCells[6]);
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${startMonth.slice(0, 3)} ${start.getDate()} - ${endMonth.slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <main className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-10 w-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Upcoming Tasks</h2>
          <p className="text-[#8C7A6B] font-medium">Plan your focus blocks and track remaining time.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex bg-[#F4EFE6] p-1 rounded-full border border-[#e4dfd8] overflow-hidden">
            <button 
              onClick={() => setView('list')}
              className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-[#E89D71]' : 'text-[#8C7A6B] hover:text-[#4A3F35]'}`}
            >
              <ListTodo size={16} className="mr-2"/> List
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-[#E89D71]' : 'text-[#8C7A6B] hover:text-[#4A3F35]'}`}
            >
              <CalendarIcon size={16} className="mr-2"/> Calendar
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center shrink-0 gap-2 bg-[#E89D71] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#d68b60] transition-colors shadow-sm active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Task
          </button>
        </div>
      </div>
      {view === 'list' ? (
        <div className="flex flex-col gap-8 animate-in fade-in duration-300">
          {categories.map(cat => renderCategoryList(cat))}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-500">
          {/* Calendar Panel */}
          <div className="flex-1 rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
            {/* Soft dark header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-0.5">Planner</p>
                <h3 className="text-2xl font-bold text-white">
                  {calMode === 'month' ? (
                    <>{monthNames[month]} <span className="text-slate-300">{year}</span></>
                  ) : (
                    getWeekRangeTitle()
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Month/Week Switcher */}
                <div className="flex bg-white/10 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setCalMode('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${calMode === 'month' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}
                  >Month</button>
                  <button 
                    onClick={() => setCalMode('week')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${calMode === 'week' ? 'bg-white text-slate-800' : 'text-slate-300 hover:text-white'}`}
                  >Week</button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrev}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-bold text-lg"
                  >‹</button>
                  <button
                    onClick={handleNext}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-bold text-lg"
                  >›</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6">
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 mb-3 text-center">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
                  <div key={d} className={`text-[11px] font-bold py-1 rounded-lg ${i === 0 || i === 6 ? 'text-rose-300' : 'text-gray-400'}`}>{d}</div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((day, i) => {
                  if (day === null && calMode === 'month') return <div key={i} className="aspect-square" />;

                  const cellDate = calMode === 'month' ? new Date(year, month, day) : day;
                  const isToday = formatDate(cellDate) === todayStr;
                  const cellDateStr = formatDate(cellDate);
                  const isSelected = selectedDate === cellDateStr;
                  const dayTasks = tasks.filter(t => t.date === cellDateStr);
                  const isWeekend = (cellDate.getDay() === 0) || (cellDate.getDay() === 6);

                  return (
                    <div
                      key={cellDateStr + i}
                      onClick={() => setSelectedDate(isSelected ? null : cellDateStr)}
                      className={`
                        relative min-h-[110px] w-full rounded-xl flex flex-col items-center justify-start pt-1.5 cursor-pointer
                        transition-all duration-200 select-none border
                        ${isSelected
                          ? 'bg-indigo-500 border-indigo-600 shadow-md shadow-indigo-200 z-10'
                          : isToday
                          ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200'
                          : isWeekend
                          ? 'bg-rose-50/50 border-rose-100/50 hover:bg-rose-100/50'
                          : 'bg-gray-50/50 border-gray-100 hover:bg-slate-100'}
                      `}
                    >
                      <span className={`text-[11px] font-black mb-1.5
                        ${isSelected ? 'text-white' : isToday ? 'text-orange-600' : isWeekend ? 'text-rose-400' : 'text-gray-400'}`}
                      >
                        {cellDate.getDate()}
                      </span>

                      {/* Task Labels (Teams-style) */}
                      <div className="w-full px-1 flex flex-col gap-1 overflow-hidden">
                        {dayTasks.slice(0, 3).map((t, idx) => {
                          const priorityColor = t.priority === 'High' 
                            ? (isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 border-rose-200') 
                            : t.priority === 'Medium' 
                            ? (isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 border-amber-200') 
                            : (isSelected ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 border-teal-100');
                            
                          return (
                            <div 
                              key={t.id} 
                              className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-bold border transition-all ${priorityColor}`}
                            >
                              {t.title}
                            </div>
                          );
                        })}
                        
                        {dayTasks.length > 3 && (
                          <div className={`text-[9px] font-black mt-0.5 pl-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>

                      {/* No tasks: Empty state visual */}
                      {dayTasks.length === 0 && !isSelected && (
                        <div className="mt-auto mb-2 w-1.5 h-1.5 rounded-full bg-gray-200" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day Stats Widget */}
              {selectedDate && (
                <div className="mt-5 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-white p-3 rounded-2xl border border-indigo-100 text-center">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Hours</p>
                    <p className="text-lg font-black text-indigo-600">
                      {(tasks.filter(t => t.date === selectedDate).reduce((a, t) => a + (t.needed || 0), 0)).toFixed(1)}h
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-rose-100 text-center">
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">🔥 High</p>
                    <p className="text-lg font-black text-rose-500">
                      {tasks.filter(t => t.date === selectedDate && t.priority === 'High').length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-amber-100 text-center">
                    <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">⚡ Mid</p>
                    <p className="text-lg font-black text-amber-500">
                      {tasks.filter(t => t.date === selectedDate && t.priority === 'Medium').length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Day Detail Panel */}
          {selectedDate && (
            <div className="w-full lg:w-96 flex flex-col gap-4 animate-in slide-in-from-right fade-in duration-500">
              {/* Panel Header */}
              <div className="bg-slate-700 rounded-[2rem] p-5 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long' })}
                  </p>
                  <h3 className="text-white text-xl font-bold mt-0.5">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>

              {/* Task list */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-1">
                {tasks.filter(t => t.date === selectedDate).length > 0 ? (
                  tasks.filter(t => t.date === selectedDate).map(t => (
                    <TaskCard key={t.id} task={t} onEdit={handleEdit} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4">
                      <ListTodo size={28} className="text-indigo-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No tasks this day</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      + Add Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal overlay */}
      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        editingTask={editingTask}
      />

    </main>
  );
}
