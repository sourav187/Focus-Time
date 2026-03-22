import React from 'react';

export default function TasksCalendarView({ 
  tasks, 
  todayStr, 
  calMode, 
  setCalMode, 
  navDate, 
  handlePrev, 
  handleNext, 
  selectedDate, 
  setSelectedDate,
  formatDate
}) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = navDate.getFullYear();
  const month = navDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const calendarCells = [];
  if (calMode === 'month') {
    for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);
  } else {
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

  return (
    <div className="flex-1 rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
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
            <button onClick={handlePrev} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-bold text-lg">‹</button>
            <button onClick={handleNext} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-bold text-lg">›</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-6">
        <div className="grid grid-cols-7 gap-1 mb-3 text-center">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
            <div key={d} className={`text-[11px] font-bold py-1 rounded-lg ${i === 0 || i === 6 ? 'text-rose-300' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>

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
                className={`relative min-h-[110px] w-full rounded-xl flex flex-col items-center justify-start pt-1.5 cursor-pointer transition-all duration-200 select-none border ${isSelected ? 'bg-indigo-500 border-indigo-600 shadow-md shadow-indigo-200 z-10' : isToday ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : isWeekend ? 'bg-rose-50/50 border-rose-100/50 hover:bg-rose-100/50' : 'bg-gray-50/50 border-gray-100 hover:bg-slate-100'}`}
              >
                <span className={`text-[11px] font-black mb-1.5 ${isSelected ? 'text-white' : isToday ? 'text-orange-600' : isWeekend ? 'text-rose-400' : 'text-gray-400'}`}>{cellDate.getDate()}</span>
                <div className="w-full px-1 flex flex-col gap-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((t, idx) => {
                    const priorityColor = t.priority === 'High' ? (isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 border-rose-200') : t.priority === 'Medium' ? (isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 border-amber-200') : (isSelected ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 border-teal-100');
                    return <div key={t.id} className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-bold border transition-all ${priorityColor}`}>{t.title}</div>;
                  })}
                  {dayTasks.length > 3 && <div className={`text-[9px] font-black mt-0.5 pl-1 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>+{dayTasks.length - 3} more</div>}
                </div>
                {dayTasks.length === 0 && !isSelected && <div className="mt-auto mb-2 w-1.5 h-1.5 rounded-full bg-gray-200" />}
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-5 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white p-3 rounded-2xl border border-indigo-100 text-center">
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Hours</p>
              <p className="text-lg font-black text-indigo-600">{(tasks.filter(t => t.date === selectedDate).reduce((a, t) => a + (t.needed || 0), 0)).toFixed(1)}h</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-rose-100 text-center">
              <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">🔥 High</p>
              <p className="text-lg font-black text-rose-500">{tasks.filter(t => t.date === selectedDate && t.priority === 'High').length}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-amber-100 text-center">
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">⚡ Mid</p>
              <p className="text-lg font-black text-amber-500">{tasks.filter(t => t.date === selectedDate && t.priority === 'Medium').length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
