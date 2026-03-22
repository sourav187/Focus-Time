import React from 'react';
import { AlertCircle } from 'lucide-react';
import TaskCard from './TaskCard';

export default function TasksListView({
  tasks,
  todayStr,
  onEdit,
  dragOverCategory,
  setDragOverCategory,
  handleDrop
}) {
  const categorizeTask = (task) => {
    const today = new Date();
    const [y, m, d] = task.date.split('-');
    const taskDate = new Date(y, m - 1, d);
    const isCompleted = task.logged >= task.needed;

    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = taskDate.getTime() - currentDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0 && isCompleted) return null;
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 30) return 'This Month';
    return 'Later';
  };

  const categories = ['Overdue', 'Today', 'Tomorrow', 'This Week', 'This Month', 'Later'];

  const categorizedTasks = categories.reduce((acc, cat) => {
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
              onEdit={onEdit}
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

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {categories.map(cat => renderCategoryList(cat))}
    </div>
  );
}
