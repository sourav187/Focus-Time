import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ListTodo } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import AddTaskModal from '../components/tasks/AddTaskModal';

// Modular Components
import TasksListView from '../components/tasks/TasksListView';
import TasksCalendarView from '../components/tasks/TasksCalendarView';
import DayDetailPanel from '../components/tasks/DayDetailPanel';

export default function TasksView() {
  const { tasks, todayStr, updateTask } = useTasks();
  const [view, setView] = useState('list'); 
  const [calMode, setCalMode] = useState('month'); 
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

  const formatDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDateForCategory = (categoryName) => {
    const today = new Date();
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

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-10 w-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-[var(--app-text)]">Upcoming Tasks</h2>
          <p className="text-[var(--app-text-muted)] font-medium">Plan your focus blocks and track remaining time.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex bg-[var(--app-border)] p-1 rounded-full border border-[var(--app-border)] overflow-hidden">
            <button 
              onClick={() => setView('list')}
              className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'list' ? 'bg-[var(--app-card)] shadow-sm text-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}`}
            >
              <ListTodo size={16} className="mr-2"/> List
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'calendar' ? 'bg-[var(--app-card)] shadow-sm text-[var(--app-accent)]' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'}`}
            >
              <CalendarIcon size={16} className="mr-2"/> Calendar
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center shrink-0 gap-2 bg-[var(--app-accent)] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#d68b60] transition-colors shadow-sm active:scale-95"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Task
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <TasksListView 
          tasks={tasks}
          todayStr={todayStr}
          onEdit={handleEdit}
          dragOverCategory={dragOverCategory}
          setDragOverCategory={setDragOverCategory}
          handleDrop={handleDrop}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-500">
          <TasksCalendarView 
            tasks={tasks}
            todayStr={todayStr}
            calMode={calMode}
            setCalMode={setCalMode}
            navDate={navDate}
            handlePrev={handlePrev}
            handleNext={handleNext}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            formatDate={formatDate}
          />

          <DayDetailPanel 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            tasks={tasks}
            onEdit={handleEdit}
            onAddTask={() => setIsModalOpen(true)}
          />
        </div>
      )}

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        editingTask={editingTask}
      />
    </main>
  );
}
