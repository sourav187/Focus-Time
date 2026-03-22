import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTasks } from '../../context/TaskContext';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function PlannedVsActualChart() {
  const { tasks } = useTasks();
  const [weekOffset, setWeekOffset] = useState(0);

  const getPlannedVsActualData = () => {
    const dataMap = {};
    const today = new Date();
    
    // Calculate start date based on weekOffset
    // weekOffset 0 = last 7 days ending today
    // weekOffset 1 = next 7 days after today
    // weekOffset -1 = 7 days before the last 7 days
    const start = new Date();
    start.setDate(today.getDate() - 6 + (weekOffset * 7));

    // Initialize 7 days range
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.getDate();
      dataMap[dStr] = { 
        name: dayLabel, 
        fullDate: dStr,
        display: `${dayLabel} ${dayNum}`,
        planned: 0, 
        actual: 0 
      };
    }

    // Aggregate tasks
    tasks.forEach(task => {
      if (dataMap[task.date]) {
        dataMap[task.date].planned += Number(task.needed || 0);
        dataMap[task.date].actual += Number(task.logged || 0);
      }
    });

    // Convert to array and round values
    return Object.values(dataMap).map(day => ({
      ...day,
      planned: Number(day.planned.toFixed(1)),
      actual: Number(day.actual.toFixed(1))
    }));
  };

  const data = getPlannedVsActualData();

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setWeekOffset(prev => prev + 1);
  const handleReset = () => setWeekOffset(0);

  // Date range label
  const getRangeLabel = () => {
    if (data.length === 0) return '';
    const first = new Date(data[0].fullDate);
    const last = new Date(data[data.length - 1].fullDate);
    const options = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString(undefined, options)} - ${last.toLocaleDateString(undefined, options)}`;
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] lg:col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#4A3F35]">Planned vs Actual</h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={14} className="text-[#8C7A6B]" />
            <p className="text-sm text-[#8C7A6B] font-medium">{getRangeLabel()}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E2E8F0]"></div>
              <span className="text-xs font-bold text-[#8C7A6B]">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#6366F1]"></div>
              <span className="text-xs font-bold text-[#8C7A6B]">Actual</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-2xl border border-[#F4EFE6]">
            <button 
              onClick={handlePrevWeek}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-[#4A3F35]"
              title="Previous Week"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={handleReset}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${weekOffset === 0 ? 'bg-white shadow-sm text-[#6366F1]' : 'text-[#8C7A6B] hover:text-[#4A3F35]'}`}
            >
              Today
            </button>
            <button 
              onClick={handleNextWeek}
              className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-[#4A3F35]"
              title="Next Week"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4EFE6" />
            <XAxis 
              dataKey="display" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8C7A6B', fontSize: 12, fontWeight: 600 }} 
              dy={10} 
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8C7A6B', fontSize: 12, fontWeight: 600 }} 
            />
            <Tooltip 
              cursor={{ fill: '#FAF8F5', radius: 10 }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', fontWeight: 600, color: '#4A3F35' }}
              formatter={(value) => [`${value} hrs`]}
            />
            <Bar 
                dataKey="planned" 
                fill="#E2E8F0" 
                radius={[6, 6, 0, 0]} 
                barSize={24}
                name="Planned Time"
            />
            <Bar 
                dataKey="actual" 
                fill="url(#actualGradient)" 
                radius={[6, 6, 0, 0]} 
                barSize={24}
                name="Actual Focus"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
