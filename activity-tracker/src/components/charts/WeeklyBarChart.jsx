import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const weeklyData = [
  { name: 'Mon', minutes: 120 },
  { name: 'Tue', minutes: 180 },
  { name: 'Wed', minutes: 150 },
  { name: 'Thu', minutes: 210 },
  { name: 'Fri', minutes: 90 },
  { name: 'Sat', minutes: 60 },
  { name: 'Sun', minutes: 0 },
];

export default function WeeklyBarChart() {
  return (
    <div className="w-full bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6] mb-12">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-semibold">Weekly Progress</h3>
        <span className="text-sm text-[#8C7A6B] font-medium bg-[#FAF8F5] px-3 py-1 rounded-full">This Week</span>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8C7A6B', fontSize: 13, fontWeight: 500 }} 
              dy={10} 
            />
            <Tooltip 
              cursor={{ fill: '#FAF8F5' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 500, color: '#4A3F35' }}
              itemStyle={{ color: '#E89D71' }}
              formatter={(value) => [`${value} min`, 'Focus Time']}
            />
            <Bar 
              dataKey="minutes" 
              radius={[6, 6, 6, 6]} 
              barSize={40}
            >
              {weeklyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Thu' ? '#E89D71' : '#F4EFE6'} style={{ transition: 'fill 0.3s ease' }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
