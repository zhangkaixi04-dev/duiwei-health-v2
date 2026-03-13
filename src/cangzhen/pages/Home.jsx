import React, { useEffect, useState } from 'react';
import GlassGreenhouse from '../components/GlassGreenhouse';
import DailyRecommend from '../components/DailyRecommend';
import MuseumWalk from '../components/MuseumWalk';
import { Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, weekly: 0 });
  const [pavilionStats, setPavilionStats] = useState([
    { id: 'sensation', label: '感知', count: 0, color: 'bg-cangzhen-sensation-main' },
    { id: 'emotion', label: '情绪', count: 0, color: 'bg-cangzhen-emotion-main' },
    { id: 'inspiration', label: '创意', count: 0, color: 'bg-cangzhen-inspiration-main' },
    { id: 'wanxiang', label: '决策', count: 0, color: 'bg-cangzhen-custom-main' }
  ]);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [hasOpenedToday, setHasOpenedToday] = useState(false);

  // Check if today's recommendation is already opened
  useEffect(() => {
      const loadData = async () => {
          const todayStr = new Date().toDateString();
          const lastOpened = localStorage.getItem('cangzhen_daily_opened');
          if (lastOpened === todayStr) {
              setHasOpenedToday(true);
          }

          // 1. Calculate Stats
          const memories = await storageService.getCangzhenMemories();
          if (memories && memories.length > 0) {
              try {
                  // Total
                  const total = memories.length;

                  // Weekly (Since Last Monday)
                  const now = new Date();
                  const day = now.getDay();
                  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                  const monday = new Date(now.setDate(diff));
                  monday.setHours(0, 0, 0, 0);
                  
                  const weekly = memories.filter(m => {
                      const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
                      return mDate >= monday;
                  }).length;

                  setStats({ total, weekly });

                  // Pavilion Stats
                  const counts = { sensation: 0, emotion: 0, inspiration: 0, wanxiang: 0 };
                  memories.forEach(m => {
                      if (counts[m.hall] !== undefined) counts[m.hall]++;
                  });

                  setPavilionStats(prev => prev.map(p => ({
                      ...p,
                      count: counts[p.id] || 0
                  })));

              } catch (e) {
                  console.error("Stats calculation error", e);
              }
          }
      };
      
      loadData();
      
      // Listen for storage changes
      const handleStorageChange = () => loadData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOpenMuseum = () => {
      // Show Modal after door animation starts (1.5s)
      setTimeout(() => {
          setShowRecommendModal(true);
      }, 1500); 
  };

  const handleCloseModal = () => {
      // 1. Mark as opened ONLY when user accepts
      const todayStr = new Date().toDateString();
      localStorage.setItem('cangzhen_daily_opened', todayStr);
      setHasOpenedToday(true);

      setShowRecommendModal(false);
      // Scroll to recommendation area
      setTimeout(() => {
          const element = document.getElementById('daily-recommend-section');
          if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 300);
  };

  return (
    <div className="min-h-screen relative p-6 pt-safe-top font-serif flex flex-col">
      {/* 1. 顶部栏 (Top Bar) - Redesigned for Mobile Visibility */}
      <header className="mb-2 relative z-20 flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <h1 className="text-lg font-medium text-cangzhen-text-main tracking-wide">
              欢迎回到专属博物馆
            </h1>
            <button className="p-2 rounded-full glass-convex text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors">
              <Settings size={20} strokeWidth={1.5} />
            </button>
        </div>
        
        {/* Moved Stats to Top */}
        <div className="flex items-center gap-6 pl-1">
            <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-cangzhen-text-secondary tracking-widest opacity-70">累计馆藏</span>
                <span className="text-xl font-light text-cangzhen-text-main font-serif">{stats.total} <span className="text-[10px]">件</span></span>
            </div>
            <div className="w-[1px] h-3 bg-cangzhen-text-secondary/20" />
            <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-cangzhen-text-secondary tracking-widest opacity-70">本周新增</span>
                <span className="text-xl font-light text-cangzhen-text-main font-serif">{stats.weekly} <span className="text-[10px]">件</span></span>
            </div>
        </div>
      </header>

      {/* 2. 核心仪表盘区域 (Greenhouse Only - Scaled Up) */}
      <div className="flex justify-center mb-8 mt-1">
          <div className="transform scale-[1.1] origin-center w-full max-w-[300px]">
             <GlassGreenhouse stats={pavilionStats} onOpen={handleOpenMuseum} isOpen={hasOpenedToday} />
          </div>
      </div>

      {/* 3. 今日推荐 (Today Recommend) - Conditional */}
      <div className="mb-8 transition-all duration-500 min-h-[100px]" id="daily-recommend-section">
          {hasOpenedToday ? (
              <div className="animate-fade-in">
                 <DailyRecommend />
              </div>
          ) : (
              <div className="glass-concave rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-cangzhen-text-secondary/50 border border-black/5 animate-pulse-slow">
                  <Sparkles size={20} className="text-cangzhen-text-secondary/40" />
                  <span className="text-xs tracking-widest font-serif">点击上方博物馆，开启今日灵感</span>
              </div>
          )}
      </div>

      {/* 4. 博物馆漫步 (Museum Walk) */}
      <div className="mb-24">
          <MuseumWalk />
      </div>

      {/* 5. Daily Recommend Modal */}
      {showRecommendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in bg-black/5 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-[32px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] animate-scale-up relative border border-white/80 flex flex-col items-center backdrop-blur-2xl bg-white/60">
                 {/* Decorative Glow */}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-[32px]" />
                 
                 <h3 className="text-xl font-serif font-bold text-cangzhen-text-main mb-8 text-center tracking-widest relative z-10 flex items-center gap-2 drop-shadow-sm">
                    <Sparkles size={18} className="text-yellow-600" /> 今日灵感签
                 </h3>
                 
                 <div className="w-full relative z-10">
                    <DailyRecommend />
                 </div>
                 
                 <button 
                    onClick={handleCloseModal}
                    className="w-full mt-8 py-3.5 rounded-full bg-cangzhen-text-main/90 hover:bg-cangzhen-text-main text-white text-sm font-medium tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-transform backdrop-blur-sm"
                 >
                     收下建议
                 </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;
