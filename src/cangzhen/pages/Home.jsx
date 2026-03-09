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
    { id: 1, hall: 'sensation', flower: 'star', text: '徒步的时候在小河里洗手，初春的河水好凉啊', time: '' },
    { id: 2, hall: 'emotion', flower: 'lily', text: '跟小猫一起晒太阳，听着小猫的呼噜声，心情大好', time: '' },
    { id: 3, hall: 'inspiration', flower: 'iris', text: '看到模拟搭建自己卧室的App 装修新家用的上', time: '' },
    { id: 4, hall: 'wanxiang', flower: 'babysbreath', text: '吃到美味的螺蛳粉，没有想象中臭不可闻 ！吸饱汤汁的炸蛋和有虎皮的鸡爪，加分！', time: '' },
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

      {/* 4. 最新珍藏 (Recent Collection) */}
      <div className="mb-24">
        <h3 className="text-sm font-medium text-cangzhen-text-secondary mb-4 px-1 uppercase tracking-widest">最近珍藏</h3>
        <div className="space-y-3">
            {latestBlooms.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
                    {/* Gradient Accent Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                        item.hall === 'sensation' ? 'from-cangzhen-sensation-main to-transparent' :
                        item.hall === 'emotion' ? 'from-cangzhen-emotion-main to-transparent' :
                        item.hall === 'inspiration' ? 'from-cangzhen-inspiration-main to-transparent' :
                        'from-cangzhen-custom-main to-transparent'
                    }`} />
                    
                    {/* Flower Icon in Concave Container */}
                    <div 
                        className="glass-concave rounded-squircle shadow-inner w-12 h-12 flex items-center justify-center shrink-0 border border-white/20"
                        style={{
                            background: item.hall === 'sensation' ? 'rgba(214, 206, 171, 0.15)' : 
                                       item.hall === 'emotion' ? 'rgba(197, 204, 174, 0.15)' : 
                                       item.hall === 'inspiration' ? 'rgba(196, 186, 208, 0.15)' : 
                                       'rgba(224, 216, 200, 0.15)'
                        }}
                    >
                        <FlowerIcon hallKey={item.hall} size={24} />
                    </div>
                    
                    {/* Text Summary */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-cangzhen-text-main">
                                    {item.hall === 'sensation' ? '感知馆' : item.hall === 'emotion' ? '情绪馆' : item.hall === 'inspiration' ? '灵感馆' : '万象馆'}
                                </span>
                                <span className="text-[10px] text-cangzhen-text-secondary italic font-italic">
                                    {item.hall === 'sensation' ? '伯利恒之星' : item.hall === 'emotion' ? '铃兰' : item.hall === 'inspiration' ? '鸢尾花' : '满天星'}
                                </span>
                            </div>
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
