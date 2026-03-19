import React from 'react';
import { TrendingUp, Target, Award } from 'lucide-react';
import TrendAreaChart from '../components/charts/TrendAreaChart';
import FocusPieChart from '../components/charts/FocusPieChart';
import WeeklyBarChart from '../components/charts/WeeklyBarChart';
import { useTasks } from '../context/TaskContext';

export default function StatsView() {
  const { totalFocusTime, currentStreak } = useTasks();

  return (
    <main className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-8 w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1">Your Progress</h2>
        <p className="text-[#8C7A6B] font-medium">Tracking your focus habits and milestones.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex flex-col gap-2 relative overflow-hidden">
          <div className="p-3 bg-[#e89d711a] rounded-xl text-[#E89D71] w-max mb-2">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm text-[#8C7A6B] font-medium">Total Focus Time</p>
          <h3 className="text-3xl font-semibold">{totalFocusTime || 0}<span className="text-xl text-[#8C7A6B] font-medium">h</span></h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex flex-col gap-2 relative overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] rounded-xl text-[#E89D71] w-max mb-2">
            <Award size={24} />
          </div>
          <p className="text-sm text-[#8C7A6B] font-medium">Current Streak</p>
          <h3 className="text-3xl font-semibold">{currentStreak || 0}<span className="text-xl text-[#8C7A6B] font-medium"> days</span></h3>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] flex flex-col gap-2 relative overflow-hidden">
          <div className="p-3 bg-[#FAF8F5] rounded-xl text-[#8C7A6B] w-max mb-2">
            <Target size={24} />
          </div>
          <p className="text-sm text-[#8C7A6B] font-medium">Overall Progress</p>
          <h3 className="text-3xl font-semibold">Active<span className="text-xl text-[#8C7A6B] font-medium"> Focus</span></h3>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <TrendAreaChart />
        <FocusPieChart />
      </div>

      <WeeklyBarChart />

    </main>
  );
}
