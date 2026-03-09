// src/cangzhen/components/DailyRecommend.jsx
import React from 'react';
import { FlowerIcon } from './FlowerIcons';

const DailyRecommend = () => {
  const recommendations = [
    {
      id: 1,
      type: 'sensation',
      text: '去公园闻一闻桂花香',
      time: '2h ago'
    },
    {
      id: 2,
      type: 'emotion',
      text: '给自己买一束花',
      time: '5h ago'
    },
    {
      id: 3,
      type: 'inspiration',
      text: '记录一个瞬间的灵感',
      time: '8h ago'
    }
  ];

  return (
    <div className="flex flex-col gap-3 justify-end">
        <h3 className="text-xs text-cangzhen-text-secondary uppercase tracking-widest px-1 mb-1">Today Recommend</h3>
        {recommendations.map((item, index) => (
            <div 
                key={item.id} 
                className="glass-convex rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.2}s` }}
            >
                {/* Background Tint */}
                <div className={`absolute inset-0 opacity-10 bg-cangzhen-${item.type}-main`} />
                
                {/* Icon */}
                <div className="w-8 h-8 rounded-squircle glass-concave shadow-inner flex items-center justify-center shrink-0">
                    <FlowerIcon hallKey={item.type} size={16} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-cangzhen-text-main font-medium truncate">{item.text}</p>
                    <p className="text-[10px] text-cangzhen-text-secondary mt-0.5">{item.time}</p>
                </div>
            </div>
        ))}
    </div>
  );
};

export default DailyRecommend;
