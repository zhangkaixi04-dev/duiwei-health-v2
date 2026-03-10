import React, { useState, useEffect } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Quote, Cloud, Gift } from 'lucide-react';

const Review = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // weekly, monthly, yearly
  const [mounted, setMounted] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // New State for Glass Box Animation

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock Data for Weekly Review - Enhanced for Emotional Palette
  const weeklyData = {
      dateRange: '3月02日 - 3月08日',
      keyword: 'Healing',
      keywordCN: '治愈',
      keywordMeaning: 'The art of stitching the soul with time.', // Added meaning
      // Complex gradient for the "Emotional Palette"
      moodGradient: 'from-[#FF9A9E] via-[#FECFEF] to-[#F6D365]', 
      moodShadow: 'shadow-red-200',
      count: 15,
      // Cohesive AI Summary (350-400 words)
      aiSummary: (
        <>
            这周的你，像一位细腻的收藏家，将日子的褶皱轻轻抚平。周二那场雨，不再只是天气的变化，而是变成了你耳边的白噪音；周五的夕阳，被你形容为“打翻的橘子汽水”。这种对外界的敏锐捕捉，是你正在重新与世界建立连接的信号。<br/><br/>
            
            烟火气也在本周变得具体而生动。三次散步，从匆忙的赶路变成了漫无目的的游荡；路口流浪猫的伸展、小店里久违的美食，这些看似琐碎的日常，其实是你用力生活的证据。你不再急着赶往下一个目的地，而是愿意在当下停留，这种“在场感”，弥足珍贵。<br/><br/>
            
            情绪虽有起伏，但你学会了在雨天撑伞。面对周三的焦虑，你没有逃避，而是选择用冥想和书写去接纳。你开始意识到，灵感不一定来自远方，它就藏在每一次深呼吸里。书本和梦境成为了你的避难所，你写下的关于“允许”的思考，证明内心正在经历一场安静的松绑。<br/><br/>
            
            这周，你做得很好。保持这份觉知，继续在这个喧嚣的世界里，修篱种菊。
        </>
      ),
      trend: [2, 3, 1, 4, 5, 2, 3], // Mon-Sun counts
      // Weighted Tags for Word Cloud
      tags: [
        { text: '雨声', weight: 5 },
        { text: '猫咪', weight: 4 },
        { text: '咖啡', weight: 3 },
        { text: '焦虑', weight: 3 },
        { text: '夕阳', weight: 2 },
        { text: '书', weight: 2 },
        { text: '梦境', weight: 2 },
        { text: '美食', weight: 1 },
        { text: '冥想', weight: 1 },
        { text: '散步', weight: 1 }
      ],
      shape: 'heart' // 'heart', 'drop', 'cat'
  };

  // Shape Layouts (Percentage based coordinates)
  const shapeLayouts = {
    heart: [
      { left: '20%', top: '25%' }, { left: '75%', top: '25%' }, // Top Lobes
      { left: '15%', top: '45%' }, { left: '85%', top: '45%' }, // Widest
      { left: '45%', top: '50%' }, // Center
      { left: '30%', top: '65%' }, { left: '65%', top: '65%' }, // Lower Cone
      { left: '50%', top: '80%' }, // Tip
      { left: '50%', top: '35%' }, // Inner Center
      { left: '50%', top: '60%' }, // Inner Lower
    ]
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9F7F2] font-serif overflow-hidden">
      
      {/* 1. Header with Tabs */}
      <header className="pt-6 pb-4 flex justify-center shrink-0 z-20">
        <div className="glass-concave p-1 rounded-full flex gap-1 bg-white/30 backdrop-blur-md">
            {['weekly', 'monthly', 'yearly'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                        px-5 py-2 rounded-full text-xs font-medium transition-all duration-500 relative overflow-hidden
                        ${activeTab === tab 
                            ? 'text-cangzhen-text-main shadow-sm' 
                            : 'text-cangzhen-text-secondary hover:bg-white/40'}
                    `}
                >
                    {activeTab === tab && (
                        <div className="absolute inset-0 bg-white/80 rounded-full shadow-sm animate-fade-in" />
                    )}
                    <span className="relative z-10">
                        {tab === 'weekly' ? '周回顾' : tab === 'monthly' ? '月回顾' : '年回顾'}
                    </span>
                </button>
            ))}
        </div>
      </header>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 px-6 space-y-6 scrollbar-hide">
          
          {/* A. Emotional Palette (Interactive Museum Box) */}
          <div className="relative w-full h-[220px]">
            
            {/* The Actual Content (Revealed State) */}
            <div className={`absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden p-6 flex flex-col justify-between group shadow-2xl ${weeklyData.moodShadow}/20 transition-all duration-1000 ${isPaletteOpen ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'}`}> 
                
                {/* Dynamic Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${weeklyData.moodGradient} animate-gradient-slow opacity-90`} />
                
                {/* Glass Overlay/Texture */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] mix-blend-overlay" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl" />

                {/* Card Content - Optimized Hierarchy */}
                
                {/* Top Row: Date & Small Label */}
                <div className="relative z-10 flex justify-between items-start">
                    <span className="text-[10px] font-medium text-white/90 tracking-widest uppercase mix-blend-overlay border border-white/30 px-3 py-1 rounded-full bg-black/5">
                        本周关键词
                    </span>
                    <div className="glass-concave px-3 py-1.5 rounded-full flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/20">
                        <Sparkles size={12} className="text-white" />
                        <span className="text-[10px] font-medium text-white tracking-widest uppercase">{weeklyData.dateRange}</span>
                    </div>
                </div>

                {/* Center: Main Keyword (Visual Anchor) */}
                <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
                     <h2 className="text-6xl font-serif font-bold text-white drop-shadow-md tracking-tight scale-y-110 mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                         {weeklyData.keywordCN}
                     </h2>
                </div>
            </div>

            {/* The "Sealed Museum" Overlay (Initial State) - CSS Triangle + Double Doors */}
            <div 
                onClick={() => setIsPaletteOpen(true)}
                className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 z-20 ${isPaletteOpen ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100 hover:scale-[1.02]'}`}
            >
                {/* Museum Structure */}
                <div className="relative transform scale-110">
                    {/* Roof */}
                    <div className="relative z-10">
                        <div className="w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[60px] border-b-white/50 backdrop-blur-md" />
                        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[60px]" viewBox="0 0 200 60" fill="none">
                            <path d="M100 0L200 60M100 0L0 60" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                            <circle cx="100" cy="0" r="2" fill="white" />
                        </svg>
                    </div>

                    {/* Body */}
                    <div className="w-[180px] h-[120px] mx-auto glass border-t-0 rounded-b-xl shadow-2xl relative bg-white/20 backdrop-blur-xl overflow-hidden mt-[-1px]">
                        
                        {/* Internal Light Glow */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-cangzhen-sensation-main/40 rounded-full blur-[30px] animate-pulse-slow" />
                        </div>

                        {/* Double Doors */}
                        <div className="absolute inset-0 flex">
                            {/* Left Door */}
                            <div className={`flex-1 h-full bg-white/30 border-r border-white/40 backdrop-blur-md relative origin-left transition-transform duration-1000 ease-in-out ${isPaletteOpen ? '-rotate-y-90 opacity-0' : 'rotate-y-0'}`}>
                                <div className="absolute top-1/2 right-2 w-1.5 h-1.5 rounded-full bg-cangzhen-text-main/20 shadow-sm" />
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                            </div>
                            {/* Right Door */}
                            <div className={`flex-1 h-full bg-white/30 border-l border-white/40 backdrop-blur-md relative origin-right transition-transform duration-1000 ease-in-out ${isPaletteOpen ? 'rotate-y-90 opacity-0' : 'rotate-y-0'}`}>
                                <div className="absolute top-1/2 left-2 w-1.5 h-1.5 rounded-full bg-cangzhen-text-main/20 shadow-sm" />
                                <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent" />
                            </div>
                        </div>

                        {/* Text Label */}
                        <div className={`absolute bottom-3 left-0 right-0 text-center transition-opacity duration-500 ${isPaletteOpen ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="text-[10px] text-cangzhen-text-secondary tracking-[0.3em] uppercase">点击开启</span>
                        </div>
                    </div>
                </div>
            </div>

          </div>

          {/* B. AI Summary (Pure Text - Enhanced for Long Content) */}
          <div className="px-2 relative">
              <Quote className="absolute -top-2 -left-1 text-cangzhen-text-main/10 w-8 h-8 fill-current transform -scale-x-100" />
              <div className="text-sm text-cangzhen-text-main/80 leading-[2.2] font-serif text-justify pt-4 pb-2 indent-0">
                  {/* First letter styling is now handled in the content JSX slightly differently or via CSS, but standard p is fine */}
                  {weeklyData.aiSummary}
              </div>
              <div className="flex justify-end mt-4">
                  <div className="h-0.5 w-12 bg-cangzhen-text-main/10 rounded-full" />
              </div>
          </div>

          {/* C. Sliding Data Modules (Horizontal Scroll) */}
          <div className="w-full overflow-x-auto flex gap-4 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
              
              {/* Module 1: Trend & Distribution */}
              <div className="min-w-[85%] snap-center glass rounded-3xl p-6 flex flex-col justify-between h-60 relative overflow-hidden">
                   <div className="flex items-center gap-2 mb-4">
                       <TrendingUp size={16} className="text-cangzhen-text-secondary" />
                       <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest">新增馆藏</h3>
                   </div>
                   
                   {/* Bar Chart */}
                   <div className="flex items-end justify-between h-full gap-3 px-2">
                      {weeklyData.trend.map((val, i) => (
                          <div key={i} className="flex flex-col items-center gap-2 w-full group">
                              <div className="w-full bg-black/5 rounded-t-md relative overflow-hidden transition-all duration-500 group-hover:bg-cangzhen-text-main/10" style={{ height: `${(val/5)*100}%` }}>
                                  <div className={`absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t from-cangzhen-text-main/20 to-transparent opacity-50`} />
                              </div>
                              <span className="text-[10px] text-cangzhen-text-secondary font-sans opacity-60">
                                  {['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]}
                              </span>
                          </div>
                      ))}
                   </div>
                   
                   <div className="absolute top-6 right-6">
                       <span className="text-3xl font-light text-cangzhen-text-main font-serif">{weeklyData.count}</span>
                       <span className="text-[10px] text-cangzhen-text-secondary ml-1">总计</span>
                   </div>
              </div>

              {/* Module 2: Shape Word Cloud (Glass Block) */}
              <div className="min-w-[85%] snap-center glass-convex rounded-3xl p-6 h-60 relative overflow-hidden flex flex-col">
                   <div className="flex items-center justify-between mb-2 z-20 relative">
                        <div className="flex items-center gap-2">
                            <Cloud size={16} className="text-cangzhen-text-secondary" />
                            <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest">心境形状</h3>
                        </div>
                        <span className="text-[10px] text-cangzhen-text-secondary/50">#{weeklyData.keywordCN}</span>
                   </div>
                   
                   {/* Shape Container */}
                   <div className="flex-1 relative w-full h-full">
                       {/* Shape Background Hint (Optional) */}
                       <div className="absolute inset-0 flex items-center justify-center opacity-5">
                            {/* A simple heart SVG as bg hint */}
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                       </div>

                       {/* Tags Mapped to Shape */}
                       {weeklyData.tags.map((tag, i) => {
                           const pos = shapeLayouts[weeklyData.shape][i] || { left: '50%', top: '50%' };
                           const fontSize = tag.weight >= 4 ? 'text-lg font-bold' : tag.weight >= 3 ? 'text-sm font-medium' : 'text-xs opacity-80';
                           const zIndex = tag.weight;
                           
                           return (
                               <span 
                                 key={tag.text} 
                                 className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110 cursor-default
                                    ${fontSize} text-cangzhen-text-main drop-shadow-sm
                                 `}
                                 style={{ 
                                     left: pos.left, 
                                     top: pos.top,
                                     zIndex: zIndex
                                 }}
                               >
                                   {tag.text}
                               </span>
                           );
                       })}
                   </div>
                   
                   {/* Decorative Blur */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cangzhen-sensation-main/20 rounded-full blur-3xl pointer-events-none" />
              </div>

          </div>
      </div>
    </div>
  );
};

export default Review;
