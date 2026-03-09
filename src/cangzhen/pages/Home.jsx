import React from 'react';
import GlassGreenhouse from '../components/GlassGreenhouse';
import DailyRecommend from '../components/DailyRecommend';
import MuseumWalk from '../components/MuseumWalk';
import { Settings } from 'lucide-react';
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

  return (
    <div className="min-h-screen relative p-6 pt-4 font-serif flex flex-col">
      {/* 1. 顶部栏 (Top Bar) */}
      <header className="mb-1 flex justify-between items-center relative z-20">
        <h1 className="text-lg font-medium text-cangzhen-text-main tracking-wide">
          欢迎回到专属博物馆
        </h1>
        <button className="p-2 rounded-full glass-convex text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors">
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* 2. 核心仪表盘区域 (Greenhouse Left + Data Right) */}
      <div className="flex items-end justify-between mb-8 pl-8 mt-1 -translate-y-8">
          {/* Left: Greenhouse Subject (Approx 2/3 width) */}
          <div className="flex-[2.2] transform scale-[0.85] origin-bottom-left -mr-4">
             <GlassGreenhouse stats={pavilionStats} />
          </div>

          {/* Right: Key Data (Approx 1/3 width) */}
          <div className="flex-[1] flex flex-col gap-5 pl-4 border-l border-cangzhen-text-secondary/20 justify-end pb-4 h-[120px]">
              <div className="flex flex-col items-start">
                  <span className="text-[10px] text-cangzhen-text-secondary tracking-widest opacity-70 mb-0.5">累计馆藏</span>
                  <span className="text-2xl font-light text-cangzhen-text-main font-serif">20</span>
              </div>
              <div className="flex flex-col items-start">
                  <span className="text-[10px] text-cangzhen-text-secondary tracking-widest opacity-70 mb-0.5">本周新增</span>
                  <span className="text-2xl font-light text-cangzhen-text-main font-serif">3</span>
              </div>
          </div>
      </div>

      {/* 3. 今日推荐 (Today Recommend) */}
      <div className="mb-8">
          <DailyRecommend />
      </div>

      {/* 4. 博物馆漫步 (Museum Walk - Replaces Recent Collection) */}
      <div className="mb-24">
          <MuseumWalk />
      </div>
    </div>
  );
};

export default Home;
