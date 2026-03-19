import React, { useState } from 'react';
import { X, Target, Clock } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, onSave, currentGoalMinutes }) {
  const [hours, setHours] = useState(Math.floor(currentGoalMinutes / 60) || 0);
  const [minutes, setMinutes] = useState(currentGoalMinutes % 60 || 0);

  if (!isOpen) return null;

  const handleSave = () => {
    const totalMinutes = (Number(hours) * 60) + Number(minutes);
    if (totalMinutes <= 0) return alert("Please enter a valid goal.");
    onSave(totalMinutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl border border-[#F4EFE6] transform transition-all animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e89d711a] rounded-xl text-[#E89D71]">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#4A3F35]">Set Daily Goal</h2>
          </div>
          <button onClick={onClose} className="text-[#8C7A6B] hover:text-[#4A3F35] transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-[#8C7A6B] mb-8 font-medium">How many hours and minutes do you want to focus today?</p>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest mb-2 px-1">Hours</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-[#FAF8F5] border-2 border-transparent focus:border-[#E89D71] rounded-2xl p-4 text-xl font-bold text-[#4A3F35] outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest mb-2 px-1">Minutes</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-[#FAF8F5] border-2 border-transparent focus:border-[#E89D71] rounded-2xl p-4 text-xl font-bold text-[#4A3F35] outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#E89D71] hover:bg-[#D88C61] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#e89d714d] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Clock size={20} />
          <span>Save Daily Goal</span>
        </button>
      </div>
    </div>
  );
}
