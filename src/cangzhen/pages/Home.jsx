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
    <div className="min-h-screen relative p-6 font-serif flex flex-col">
      {/* 1. 顶部栏 (Top Bar) */}
      <header className="mt-8 mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light text-cangzhen-text-main tracking-wide leading-tight">
            累计馆藏 <span className="font-medium">20</span> 件
            <br />
            本周新增 <span className="font-medium">3</span> 件
          </h1>
        </div>
        <button className="p-2 rounded-full glass-convex text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors">
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* 2. 核心仪表盘区域 (Greenhouse Centered) */}
      <div className="flex justify-center mb-10">
          <GlassGreenhouse stats={pavilionStats} />
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
                    <div className="glass-concave rounded-squircle shadow-inner w-12 h-12 flex items-center justify-center shrink-0 bg-white/10 border border-white/40">
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
