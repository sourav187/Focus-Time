import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ListTodo, AlertCircle } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

export default function TasksView() {
  const { tasks } = useTasks();
  const [view, setView] = useState('list'); // 'list' | 'calendar'
  
  const today = new Date();
  
  // Helper to format date as YYYY-MM-DD
  const formatDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const categorizeTask = (taskDateStr) => {
    const [y, m, d] = taskDateStr.split('-');
    const taskDate = new Date(y, m - 1, d);
    
    // Reset time for strictly day calculation based on today
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = taskDate.getTime() - currentDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    // Let's bucket within next 7 days as "This Week"
    if (diffDays <= 7) return 'This Week';
    // Let's bucket within 30 days as "This Month"
    if (diffDays <= 30) return 'This Month';
    return 'Later';
  };

  const categories = ['Overdue', 'Today', 'This Week', 'This Month', 'Later'];
  const categorizedTasks = categories.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => categorizeTask(t.date) === cat);
    return acc;
  }, {});

  const renderCategoryList = (categoryName) => {
    const list = categorizedTasks[categoryName];
    if (list.length === 0 && categoryName !== 'Today') return null; // Always show Today even if empty
    
    return (
      <section key={categoryName}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${categoryName === 'Overdue' ? 'text-red-500' : 'text-[#4A3F35]'}`}>
          {categoryName === 'Overdue' && <AlertCircle size={18} />}
          {categoryName}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryName === 'Today' ? 'bg-[#FAF8F5] text-[#E89D71] border-[#F4EFE6]' : 'bg-[#FAF8F5] text-[#8C7A6B] border-[#F4EFE6]'}`}>
            {list.length}
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(task => <TaskCard key={task.id} task={task} />)}
          {list.length === 0 && categoryName === 'Today' && <p className="text-sm text-gray-400 italic py-4">No tasks planned for today.</p>}
        </div>
      </section>
    );
  };

  const priorityColors = {
    'High': 'bg-red-50 text-red-600 border border-red-100',
    'Medium': 'bg-orange-50 text-orange-600 border border-orange-100',
    'Low': 'bg-gray-50 text-gray-500 border border-gray-100'
  };

  // Calendar logic
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

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
        <div className="flex flex-col gap-10 animate-in fade-in duration-300">
          {categories.map(cat => renderCategoryList(cat))}
        </div>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] animate-in fade-in duration-300 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold">{monthNames[month]} {year}</h3>
            <div className="flex gap-2 bg-[#FAF8F5] p-1 rounded-xl">
               <button className="px-4 py-1 rounded-lg hover:bg-white hover:shadow-sm text-[#8C7A6B] hover:text-[#4A3F35] transition-all font-medium">Prev</button>
               <button className="px-4 py-1 rounded-lg hover:bg-white hover:shadow-sm text-[#8C7A6B] hover:text-[#4A3F35] transition-all font-medium">Next</button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-xs md:text-sm font-semibold text-[#8C7A6B]">{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2 md:gap-3">
              {calendarCells.map((day, i) => {
                 if (!day) return <div key={i} className="aspect-square sm:aspect-auto sm:min-h-[110px] rounded-[1rem] p-2 bg-transparent"></div>;

                 const isToday = day === today.getDate();
                 const cellDateStr = formatDate(new Date(year, month, day));
                 const dayTasks = tasks.filter(t => t.date === cellDateStr);

                 return (
                   <div key={i} className={`aspect-square sm:aspect-auto sm:min-h-[110px] rounded-[1rem] p-2 md:p-3 flex flex-col items-start border transition-all duration-300 bg-white border-[#F4EFE6] hover:border-[#E89D71]/40 hover:shadow-sm ${isToday ? 'ring-2 ring-[#E89D71] ring-offset-2 border-transparent' : ''}`}>
                     <span className={`text-xs md:text-sm font-semibold mb-2 ${isToday ? 'text-[#E89D71]' : 'text-[#8C7A6B]'}`}>{day}</span>
                     
                     {dayTasks.length > 0 && (
                       <div className="mt-auto w-full flex flex-col gap-1.5 overflow-hidden">
                         {dayTasks.map((t, idx) => (
                           <div key={idx} className={`w-full text-[10px] font-bold px-2 py-1.5 rounded-lg truncate shadow-sm hidden sm:block ${priorityColors[t.priority || 'Medium']}`}>
                             {t.title}
                           </div>
                         ))}
                         {/* Mobile task dot */}
                         <div className="sm:hidden w-1.5 h-1.5 rounded-full bg-[#E89D71] mt-1 mx-auto"></div>
                       </div>
                     )}
                   </div>
                 )
              })}
          </div>
        </div>
      )}

      {/* Add Task Modal overlay */}
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </main>
  );
}
