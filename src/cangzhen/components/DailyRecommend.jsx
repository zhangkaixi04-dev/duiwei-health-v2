// src/cangzhen/components/DailyRecommend.jsx
import React from 'react';
import { FlowerIcon } from './FlowerIcons';

const DailyRecommend = () => {


  // Daily Content Library (Simulated AI Updates)
  const dailyContent = {
    sensation: [
      '去公园闻一闻桂花香',
      '观察一片叶子的纹理',
      '听一听雨滴落在窗台的声音',
      '触摸清晨的露水'
    ],
    emotion: [
      '给自己买一束花',
      '记录下今天的一个微笑',
      '拥抱一下自己',
      '允许自己发一会儿呆'
    ],
    inspiration: [
      '记录一个瞬间的灵感',
      '读一首喜欢的诗',
      '画一幅随笔画',
      '思考一个未解的问题'
    ]
  };

  // Logic to pick content based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Use modulo to cycle through content daily
  const sensationIndex = dayOfYear % dailyContent.sensation.length;
  const emotionIndex = dayOfYear % dailyContent.emotion.length;
  const inspirationIndex = dayOfYear % dailyContent.inspiration.length;

  const displayRecommendations = [
      {
          id: 1,
          type: 'sensation',
          text: dailyContent.sensation[sensationIndex],
          time: ''
      },
      {
          id: 2,
          type: 'emotion',
          text: dailyContent.emotion[emotionIndex],
          time: ''
      },
      {
          id: 3,
          type: 'inspiration',
          text: dailyContent.inspiration[inspirationIndex],
          time: ''
      }
  ];

  return (
    <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-cangzhen-text-secondary mb-1 px-1 uppercase tracking-widest">今日推荐</h3>
        {displayRecommendations.map((item, index) => (
            <div 
                key={item.id} 
                className="glass-convex rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.2}s` }}
            >
                {/* Background Tint */}
                <div className={`absolute inset-0 opacity-10 bg-cangzhen-${item.type}-main`} />
                
                {/* Icon */}
                <div className="w-10 h-10 rounded-squircle glass-concave shadow-inner flex items-center justify-center shrink-0">
                    <FlowerIcon hallKey={item.type} size={20} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-cangzhen-text-main font-medium truncate">{item.text}</p>
                </div>
            </div>
        ))}
    </div>
  );
};

export default DailyRecommend;
