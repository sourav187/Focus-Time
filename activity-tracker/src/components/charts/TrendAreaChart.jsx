import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { name: 'Week 1', hours: 12 },
  { name: 'Week 2', hours: 18 },
  { name: 'Week 3', hours: 15 },
  { name: 'Week 4', hours: 24 },
];

export default function TrendAreaChart() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F4EFE6]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Monthly Trend</h3>
        <p className="text-sm text-[#8C7A6B] font-medium">Focus hours over the last 4 weeks</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E89D71" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#E89D71" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8C7A6B', fontSize: 12, fontWeight: 500 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8C7A6B', fontSize: 12, fontWeight: 500 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 500, color: '#4A3F35' }}
              itemStyle={{ color: '#E89D71' }}
              formatter={(value) => [`${value} hrs`, 'Total']}
            />
            <Area type="monotone" dataKey="hours" stroke="#E89D71" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
