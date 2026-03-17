import React from 'react';
import { Utensils, Hand, Circle, Plus, MoreHorizontal } from 'lucide-react';

const PortionPromptCard = ({ foodName, onSelect, onCustomInput }) => {
  const portions = [
    { weight: 50, label: '50g', desc: '一小把 / 约几口', icon: <Utensils className="w-4 h-4" /> },
    { weight: 100, label: '100g', desc: '约手掌大小', icon: <Hand className="w-4 h-4" /> },
    { weight: 150, label: '150g', desc: '正常一人份', icon: <Circle className="w-4 h-4" /> },
    { weight: 200, label: '200g', desc: '份量超足', icon: <MoreHorizontal className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-lg mx-4 mb-4 animate-fade-in-up space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-brand/10 p-1.5 rounded-lg text-brand">
          <Utensils className="w-4 h-4" />
        </span>
        <h3 className="font-bold text-text-main">大约吃了多少呢？</h3>
      </div>

      {foodName && (
        <div className="bg-brand/5 p-3 rounded-xl border border-brand/10">
          <span className="text-sm text-brand font-medium">
            记录: {foodName}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {portions.map((portion) => (
          <button
            key={portion.weight}
            onClick={() => onSelect(portion.weight, portion.label)}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
              {portion.icon}
            </div>
            <span className="text-sm font-bold text-text-main">{portion.label}</span>
            <span className="text-[10px] text-text-muted text-center">{portion.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onCustomInput}
        className="w-full py-3 text-brand text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand/5 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />
        自己输入克数
      </button>
    </div>
  );
};

export default PortionPromptCard;
