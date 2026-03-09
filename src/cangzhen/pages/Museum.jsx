// src/cangzhen/pages/Museum.jsx
import React, { useState } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';

const pavilions = [
  { 
    id: 'sensation', 
    name: '感知馆', 
    enName: 'Sensation · Star of Bethlehem', 
    desc: '纯粹的物理感官输入（视/听/嗅/味/触）',
    flower: 'star',
    color: 'bg-cangzhen-sensation-main',
    accent: 'text-[#8A9470]'
  },
  { 
    id: 'emotion', 
    name: '情绪馆', 
    enName: 'Emotion · Lily of the Valley', 
    desc: '主观心理反应与状态',
    flower: 'lily',
    color: 'bg-cangzhen-emotion-main',
    accent: 'text-[#6A8C5E]'
  },
  { 
    id: 'inspiration', 
    name: '灵感馆', 
    enName: 'Inspiration · Iris', 
    desc: '思考、顿悟、创意、梦境',
    flower: 'iris',
    color: 'bg-cangzhen-inspiration-main',
    accent: 'text-[#6B7A60]'
  },
  { 
    id: 'custom', 
    name: '自定义馆', 
    enName: 'My Gallery · Baby\'s Breath', 
    desc: '用户标签生成的个人展区',
    flower: 'star', // Placeholder for Baby's Breath
    color: 'bg-cangzhen-custom-main',
    accent: 'text-cangzhen-text-secondary'
  }
];

// Mock data for memories
const memories = [
  { id: 1, type: 'sensation', date: '2026.03.08', content: '路边看到一只橘猫在晒太阳，毛发金灿灿的。', tag: '视觉' },
  { id: 2, type: 'emotion', date: '2026.03.07', content: '今天被陌生人夸奖了，开心了一整天。', tag: '开心' },
  { id: 3, type: 'inspiration', date: '2026.03.06', content: '如果是风，会带走什么？', tag: '思考' },
  { id: 4, type: 'sensation', date: '2026.03.05', content: '喝了一杯很苦的咖啡，但是回甘很甜。', tag: '味觉' },
  { id: 5, type: 'emotion', date: '2026.03.04', content: '有点焦虑，不知道未来在哪里。', tag: '焦虑' },
];

const Museum = () => {
  const [activePavilion, setActivePavilion] = useState('sensation');
  const currentPavilion = pavilions.find(p => p.id === activePavilion);
  const filteredMemories = memories.filter(m => m.type === activePavilion || activePavilion === 'custom'); // Show all for custom mock

  return (
    <div className="min-h-screen relative flex flex-col pt-8 pb-24 font-serif">
      {/* 1. 顶部标题 */}
      <header className="px-6 mb-6">
        <h1 className="text-3xl font-medium text-cangzhen-text-main">博物馆</h1>
        <p className="text-sm font-italic text-cangzhen-text-secondary italic tracking-wider">The Gallery of Memories</p>
      </header>

      {/* 2. 展馆标签栏 */}
      <div className="px-6 mb-8 overflow-x-auto no-scrollbar snap-x">
        <div className="flex gap-3 w-max">
          {pavilions.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePavilion(p.id)}
              className={`
                px-5 py-2 rounded-full text-sm transition-all duration-300 snap-center whitespace-nowrap
                ${activePavilion === p.id ? 'glass-pressed text-cangzhen-text-main font-medium scale-105' : 'glass-convex text-cangzhen-text-secondary'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                {p.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 展馆头部 */}
      <div className="px-6 mb-8 flex flex-col items-center text-center animate-fade-in">
         <div className="mb-4 relative">
            <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${currentPavilion.color}`} />
            <FlowerIcon hallKey={currentPavilion.id} size={64} className="relative z-10" />
         </div>
         <h2 className={`text-2xl font-medium mb-1 ${currentPavilion.accent}`}>{currentPavilion.name}</h2>
         <p className="text-xs font-italic text-cangzhen-text-secondary italic mb-3">{currentPavilion.enName}</p>
         <p className="text-xs text-cangzhen-text-main/70 max-w-[80%] leading-relaxed">{currentPavilion.desc}</p>
      </div>

      {/* 4. 记忆卡片画廊 (Horizontal Scroll) */}
      <div className="flex-1 overflow-x-auto snap-x snap-mandatory px-6 no-scrollbar pb-8 items-center flex">
         <div className="flex gap-6 w-max items-center pr-6">
            {filteredMemories.length > 0 ? (
                filteredMemories.map(memory => (
                    <div 
                        key={memory.id} 
                        className="glass w-[75vw] h-[360px] flex-shrink-0 snap-center p-6 flex flex-col justify-between relative group transition-transform duration-300 hover:scale-[1.02]"
                    >
                        {/* Top: Tag & Date */}
                        <div className="flex justify-between items-start">
                            <span className="glass-convex px-3 py-1 text-[10px] text-cangzhen-text-secondary rounded-full">
                                #{memory.tag}
                            </span>
                            <span className="text-xs font-italic text-cangzhen-text-secondary/60 italic">
                                {memory.date}
                            </span>
                        </div>

                        {/* Middle: Content */}
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-lg text-cangzhen-text-main leading-loose font-serif text-center px-2">
                                {memory.content}
                            </p>
                        </div>

                        {/* Bottom: Flower Decor */}
                        <div className="flex justify-center opacity-20">
                             <FlowerIcon hallKey={memory.type} size={32} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="w-[85vw] h-[300px] flex flex-col items-center justify-center text-cangzhen-text-secondary gap-4">
                    <p className="text-sm italic">这里还是空的...</p>
                    <button className="glass-convex px-6 py-2 text-xs">去记录第一笔</button>
                </div>
            )}
            
            {/* Spacer for end of scroll */}
            <div className="w-2" />
         </div>
      </div>

      {/* 5. 底部统计 */}
      <div className="px-6 text-center mt-auto">
          <p className="text-[10px] text-cangzhen-text-secondary/50 uppercase tracking-widest">
              {filteredMemories.length} Memories Collected
          </p>
      </div>
    </div>
  );
};

export default Museum;
