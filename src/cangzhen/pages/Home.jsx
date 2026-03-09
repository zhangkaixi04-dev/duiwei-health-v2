// src/cangzhen/pages/Home.jsx
import React from 'react';
import GlassGreenhouse from '../components/GlassGreenhouse';
import DailyRecommend from '../components/DailyRecommend';
import { Settings } from 'lucide-react';
import { FlowerIcon } from '../components/FlowerIcons';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Mock data for Pavilion Counters
  const pavilionStats = [
    { id: 'sensation', label: '感知', count: 12, color: 'bg-cangzhen-sensation-main' },
    { id: 'emotion', label: '情绪', count: 5, color: 'bg-cangzhen-emotion-main' },
    { id: 'inspiration', label: '灵感', count: 8, color: 'bg-cangzhen-inspiration-main' },
    { id: 'wanxiang', label: '万象', count: 0, color: 'bg-cangzhen-custom-main' }
  ];

  // Mock data for Latest Blooms
  const latestBlooms = [
    { id: 1, hall: 'sensation', flower: 'star', text: '清晨的雨声，滴答滴答...', time: '2小时前' },
    { id: 2, hall: 'emotion', flower: 'lily', text: '听到那首歌，突然很想哭。', time: '昨天' },
    { id: 3, hall: 'inspiration', flower: 'iris', text: '万物皆有裂痕，那是光照进来的地方。', time: '3天前' },
  ];

  return (
    <div className="min-h-screen relative p-6 font-serif flex flex-col">
      {/* 1. 顶部栏 (Top Bar) */}
      <header className="mt-8 mb-4 flex justify-between items-start">
        <div>
          <p className="text-cangzhen-text-secondary text-sm font-italic italic tracking-wider mb-1">
            Sunday, March 8
          </p>
          <h1 className="text-3xl font-light text-cangzhen-text-main tracking-wide">
            午安，
            <br />
            <span className="font-medium">今天的风是什么味道？</span>
          </h1>
        </div>
        <button className="p-2 rounded-full glass-convex text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors">
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* 2. 核心仪表盘区域 (2-Column Grid) */}
      <div className="grid grid-cols-12 gap-2 mb-8 items-end">
          {/* Left: Greenhouse Dashboard (7 Columns) */}
          <div className="col-span-7 flex justify-center pb-8">
              <GlassGreenhouse stats={pavilionStats} />
          </div>

          {/* Right: Daily Recommend (5 Columns) */}
          <div className="col-span-5 flex flex-col justify-end pb-8">
              <DailyRecommend />
          </div>
      </div>

      {/* 3. 最新绽放 (Latest Blooms) */}
      <div className="mb-24">
        <h3 className="text-sm font-medium text-cangzhen-text-secondary mb-4 px-1 uppercase tracking-widest">Latest Blooms</h3>
        <div className="space-y-3">
            {latestBlooms.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                    {/* Flower Icon in Concave Container */}
                    <div className="glass-concave rounded-squircle shadow-inner w-12 h-12 flex items-center justify-center shrink-0 bg-white/10">
                        <FlowerIcon hallKey={item.hall} size={24} />
                    </div>
                    
                    {/* Text Summary */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-cangzhen-text-main">
                                    {item.hall === 'sensation' ? '感知馆' : item.hall === 'emotion' ? '情绪馆' : '灵感馆'}
                                </span>
                                <span className="text-[10px] text-cangzhen-text-secondary italic font-italic">
                                    {item.hall === 'sensation' ? '伯利克之星' : item.hall === 'emotion' ? '铃兰' : '鸢尾花'}
                                </span>
                            </div>
                            <span className="text-[10px] text-cangzhen-text-secondary/60">{item.time}</span>
                        </div>
                        <p className="text-sm text-cangzhen-text-main/80 truncate font-serif leading-relaxed">
                            {item.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
