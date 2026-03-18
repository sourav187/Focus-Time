import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const subjectData = [
  { name: 'Deep Work', value: 45 },
  { name: 'Reading', value: 25 },
  { name: 'Admin', value: 20 },
  { name: 'Learning', value: 10 },
];
const COLORS = ['#E89D71', '#8C7A6B', '#D0BCAE', '#e4dfd8'];

export default function FocusPieChart() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Focus Distribution</h3>
        <p className="text-sm text-[#8C7A6B] font-medium">Where your time goes</p>
      </div>
      <div className="h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={subjectData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {subjectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 500, color: '#4A3F35' }}
              formatter={(value) => [`${value}%`]}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <div className="flex flex-col gap-3 ml-4">
          {subjectData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-sm font-medium text-[#4A3F35]">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
