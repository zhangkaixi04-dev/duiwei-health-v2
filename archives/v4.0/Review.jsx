import React, { useState, useEffect } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Quote, Cloud, Gift, X } from 'lucide-react';

const Review = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // weekly, monthly, yearly
  const [mounted, setMounted] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // New State for Glass Box Animation
  const [expandedMonth, setExpandedMonth] = useState(null); // Track which month is expanded

  const [localMemories, setLocalMemories] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Load memories for Yearly Review "Light Up" logic
    const stored = localStorage.getItem('cangzhen_memories');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            setLocalMemories(parsed);
        } catch (e) {
            console.error("Failed to parse memories", e);
        }
    }
  }, []);

  // Mock Data for Weekly Review - Enhanced for Emotional Palette
  const weeklyData = {
      dateRange: '3月02日 - 3月08日',
      keyword: 'Healing',
      keywordCN: '治愈',
      keywordMeaning: 'The art of stitching the soul with time.', // Added meaning
      // Fallback gradient in case image fails
      bgGradient: 'bg-gradient-to-br from-[#E0E7D8] to-[#F5F7F0]', // Soft botanical green
      // botanical/nature theme image (Denser texture)
      bgImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2787&auto=format&fit=crop', 
      moodShadow: 'shadow-green-100',
      count: 15,
      // Cohesive AI Summary (Refined: Little Red Book Style, Relaxed, Real)
      aiSummary: (
        <>
            这周过得挺有意思的，好像终于学会了“慢下来”这回事。<br/><br/>
            
            周二那场大雨，本来挺烦人的，但你居然没抱怨，反而坐在窗边听了好久。你说那个声音像把世界按了静音键，那一刻，感觉你心里紧绷的那根弦，松了一点点。<br/><br/>
            
            这几天你好像更愿意把时间浪费在具体的小事上了。路口那只流浪猫，你停下来逗了它五分钟；周五下班没直接回家，去吃了碗热乎乎的面，还在备忘录里写“今天的夕阳像咸蛋黄”。这些不起眼的瞬间，其实才是生活原本的样子啊。<br/><br/>
            
            也有焦虑的时候，特别是周三晚上，看你写了好多关于未来的担忧。但这次你没逼自己马上好起来，而是允许自己丧一会儿，睡了一觉，第二天照样起来面对。这种“允许自己不完美”的心态，真的挺酷的。<br/><br/>
            
            总的来说，这周你没那么紧绷了，开始懂得在缝隙里找糖吃。不用急着赶路，现在的节奏就刚刚好。下周继续保持这份松弛感，咱们慢慢来。
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

  // Mock Data for Monthly Review - 12 Glass Cubes
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const isActive = month <= currentMonth; // Active if past or current month
      const hasContent = isActive && month % 2 !== 0; // Mock: Odd months have content
      
      return {
          month,
          isActive,
          hasContent,
          keyword: hasContent ? ['新生', '探索', '绽放', '沉淀', '收获', '归藏'][Math.floor(Math.random() * 6)] : '',
          color: hasContent ? `bg-gradient-to-br from-[#FF9A9E]/20 to-[#FECFEF]/20` : 'bg-white/5',
          count: hasContent ? Math.floor(Math.random() * 50) + 10 : 0,
          // Add detailed data for expanded view (mock) - Monthly Differentiation
          aiSummary: (
            <>
                <strong>3月·状态复盘</strong><br/><br/>
                这个月回头看，感觉你像是从那种“紧绷绷”的状态里一点点把自己给松绑了。<br/><br/>
                
                <strong>关于“松绑”</strong><br/>
                月初那周，你哪怕在休息日也要把计划排得满满的，生怕漏掉什么，那时候你的关键词全是“效率”。但到了中旬，明显感觉到不一样了。你开始允许自己在周三晚上什么都不做，就发呆；你也开始在日记里写“不想讨好任何人了”。这种从“必须做”到“我想做”的转变，真的挺难得的。<br/><br/>

                <strong>那些被留住的瞬间</strong><br/>
                虽然心态在变，但你骨子里那种对美好的捕捉力一直没变。这四周里，你一共记录了 5 次晚霞、3 次路边的花，还有好几次关于食物的热气。这些细碎的瞬间，就像是你生活的锚点，无论多忙，都能把你拉回当下。<br/><br/>

                <strong>本月最酷的事</strong><br/>
                必须要提的是 18 号那天，你拒绝了一个让你不舒服的请求。以前你可能会纠结好久，但这次你很干脆。那一刻的你，真的很帅。这就是成长的痕迹吧。<br/><br/>
                
                三月过得挺扎实的。哪怕有些天还是会迷茫，但那种“知道自己在变好”的底气，已经慢慢出来了。下个月，继续按自己的节奏走。
            </>
          ),
          trend: Array.from({length: 30}, () => Math.floor(Math.random() * 5)),
          tags: weeklyData.tags // Reuse tags for demo
      };
  });

  // Data for Yearly Review - Real Data Mapping
  const currentYear = new Date().getFullYear();
  const daysInYear = ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) ? 366 : 365;
  
  const yearlyData = Array.from({ length: daysInYear }, (_, i) => {
      const date = new Date(currentYear, 0, i + 1); // Jan 1st + i days
      const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }); // "3/8" or "3月8日" depending on locale, safer to use ISO for matching if possible, but let's match loose for now or use timestamp checks.
      
      // Check if we have a memory for this day
      // Memories in localStorage have 'id' as timestamp or 'date' string.
      // We'll check both for robustness.
      const memory = localMemories.find(m => {
          // Check by Timestamp (if id is number)
          if (typeof m.id === 'number') {
              const mDate = new Date(m.id);
              return mDate.getFullYear() === currentYear &&
                     mDate.getMonth() === date.getMonth() &&
                     mDate.getDate() === date.getDate();
          }
          // Check by Date String (if 'date' field exists like "3月8日")
          if (m.date && typeof m.date === 'string') {
             // This is a bit loose, assumes "X月X日" format and current year
             return m.date === `${date.getMonth() + 1}月${date.getDate()}日`;
          }
          return false;
      });

      // Determine color - Unified Warm Yellow Glass Bead
      let beadColor = 'bg-white/5'; // Default empty state (faint glass)
      let beadGlow = '';
      
      if (memory) {
          // Warm Yellow / Amber for "Light Up"
          beadColor = 'bg-gradient-to-br from-[#F6D365] to-[#FDA085]'; 
          beadGlow = 'shadow-[0_0_8px_rgba(246,211,101,0.6)]';
      }

      return {
          day: i + 1,
          date: date,
          isLit: !!memory,
          color: beadColor,
          glow: beadGlow,
          intensity: memory ? 0.9 + Math.random() * 0.1 : 0 
      };
  });

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
                    onClick={() => { setActiveTab(tab); setExpandedMonth(null); }}
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
          
          {/* CONTENT FOR WEEKLY TAB */}
          {activeTab === 'weekly' && (
             <>
                {/* A. Emotional Palette (Interactive Museum Box) */}
                <div className="relative w-full h-[160px]">
                    {/* The Actual Content (Revealed State) */}
                    <div className={`absolute inset-0 w-full h-full rounded-xl overflow-hidden group shadow-xl ${weeklyData.moodShadow}/20 transition-all duration-1000 ${isPaletteOpen ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'}`}> 
                        
                        {/* 1. Background Image Layer - Botanical Theme */}
                        <div className={`absolute inset-0 ${weeklyData.bgGradient}`}>
                            <img 
                                src={weeklyData.bgImage} 
                                alt="Botanical Background" 
                                className="w-full h-full object-cover transition-transform duration-[10s] ease-in-out group-hover:scale-110 opacity-80"
                                onError={(e) => e.target.style.display = 'none'} 
                            />
                            {/* Soft Overlay */}
                            <div className="absolute inset-0 bg-white/10" />
                        </div>

                        {/* 2. Glass Overlay (Centered, Compact) */}
                        <div className="absolute inset-x-12 inset-y-6 bg-white/5 backdrop-blur-[10px] border border-white/30 rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center p-4 overflow-hidden">
                            
                            {/* Reflection */}
                            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-45 pointer-events-none" />
                            
                            {/* Content - All Centered */}
                            <div className="relative z-10 flex flex-col items-center text-center gap-1">
                                <span className="text-[10px] font-medium text-white/80 tracking-[0.4em] uppercase mb-1">
                                    本周关键词
                                </span>
                                <h2 className="text-4xl font-serif font-bold text-white drop-shadow-lg tracking-widest">
                                    {weeklyData.keywordCN}
                                </h2>
                            </div>
                        </div>
                    </div>
                    {/* The "Sealed Museum" Overlay */}
                    <div 
                        onClick={() => setIsPaletteOpen(true)}
                        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-1000 z-20 ${isPaletteOpen ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100 hover:scale-[1.02]'}`}
                    >
                        <div className="relative transform scale-110">
                            <div className="relative z-10">
                                <div className="w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[60px] border-b-white/50 backdrop-blur-md" />
                                <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[60px]" viewBox="0 0 200 60" fill="none">
                                    <path d="M100 0L200 60M100 0L0 60" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                                    <circle cx="100" cy="0" r="2" fill="white" />
                                </svg>
                            </div>
                            <div className="w-[180px] h-[120px] mx-auto glass border-t-0 rounded-b-xl shadow-2xl relative bg-white/20 backdrop-blur-xl overflow-hidden mt-[-1px]">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-cangzhen-sensation-main/40 rounded-full blur-[30px] animate-pulse-slow" />
                                </div>
                                <div className="absolute inset-0 flex">
                                    <div className={`flex-1 h-full bg-white/30 border-r border-white/40 backdrop-blur-md relative origin-left transition-transform duration-1000 ease-in-out ${isPaletteOpen ? '-rotate-y-90 opacity-0' : 'rotate-y-0'}`}>
                                        <div className="absolute top-1/2 right-2 w-1.5 h-1.5 rounded-full bg-cangzhen-text-main/20 shadow-sm" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                                    </div>
                                    <div className={`flex-1 h-full bg-white/30 border-l border-white/40 backdrop-blur-md relative origin-right transition-transform duration-1000 ease-in-out ${isPaletteOpen ? 'rotate-y-90 opacity-0' : 'rotate-y-0'}`}>
                                        <div className="absolute top-1/2 left-2 w-1.5 h-1.5 rounded-full bg-cangzhen-text-main/20 shadow-sm" />
                                        <div className="absolute inset-0 bg-gradient-to-l from-white/10 to-transparent" />
                                    </div>
                                </div>
                                <div className={`absolute bottom-3 left-0 right-0 text-center transition-opacity duration-500 ${isPaletteOpen ? 'opacity-0' : 'opacity-100'}`}>
                                    <span className="text-[10px] text-cangzhen-text-secondary tracking-[0.3em] uppercase">点击开启</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. AI Summary */}
                <div className="px-2 relative">
                    <Quote className="absolute -top-2 -left-1 text-cangzhen-text-main/10 w-8 h-8 fill-current transform -scale-x-100" />
                    <div className="text-sm text-cangzhen-text-main/80 leading-[2.2] font-serif text-justify pt-4 pb-2 indent-0">
                        {weeklyData.aiSummary}
                    </div>
                    <div className="flex justify-end mt-4">
                        <div className="h-0.5 w-12 bg-cangzhen-text-main/10 rounded-full" />
                    </div>
                </div>

                {/* C. Sliding Data Modules */}
                <div className="w-full overflow-x-auto flex gap-4 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
                    <div className="min-w-[85%] snap-center glass rounded-3xl p-6 flex flex-col justify-between h-60 relative overflow-hidden">
                         <div className="flex items-center gap-2 mb-4">
                             <TrendingUp size={16} className="text-cangzhen-text-secondary" />
                             <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest">新增馆藏</h3>
                         </div>
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
                    <div className="min-w-[85%] snap-center glass-convex rounded-3xl p-6 h-60 relative overflow-hidden flex flex-col">
                         <div className="flex items-center justify-between mb-2 z-20 relative">
                              <div className="flex items-center gap-2">
                                  <Cloud size={16} className="text-cangzhen-text-secondary" />
                                  <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest">心境形状</h3>
                              </div>
                              <span className="text-[10px] text-cangzhen-text-secondary/50">#{weeklyData.keywordCN}</span>
                         </div>
                         <div className="flex-1 relative w-full h-full">
                             <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                             </div>
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
                                       style={{ left: pos.left, top: pos.top, zIndex: zIndex }}
                                     >
                                         {tag.text}
                                     </span>
                                 );
                             })}
                         </div>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cangzhen-sensation-main/20 rounded-full blur-3xl pointer-events-none" />
                    </div>
                </div>
             </>
          )}

          {/* CONTENT FOR MONTHLY TAB */}
          {activeTab === 'monthly' && (
             <div className="flex-1 h-full flex flex-col justify-center relative">
                 {/* Standard View: 12 Glass Cubes */}
                 {!expandedMonth && (
                    <>
                         <div className="w-full overflow-x-auto flex gap-6 px-6 pb-10 pt-4 snap-x snap-mandatory scrollbar-hide items-center h-[400px]">
                             {monthlyData.map((data, i) => (
                                 <div 
                                     key={i}
                                     onClick={() => data.hasContent && setExpandedMonth(data)}
                                     className={`
                                        min-w-[260px] h-[340px] snap-center rounded-[2.5rem] relative overflow-hidden transition-all duration-500 flex flex-col justify-between p-8 group
                                        ${data.hasContent 
                                            ? 'glass-convex shadow-2xl scale-100 opacity-100 hover:scale-[1.02] cursor-pointer' 
                                            : 'glass-concave shadow-inner scale-95 opacity-50 grayscale cursor-not-allowed'}
                                     `}
                                 >
                                     {/* Month Number (Large background) */}
                                     <div className={`absolute -top-6 -right-6 text-[120px] font-serif font-bold opacity-5 leading-none select-none ${data.hasContent ? 'text-cangzhen-text-main' : 'text-gray-400'}`}>
                                         {data.month}
                                     </div>

                                     {/* Content or "Empty" State */}
                                     {data.hasContent ? (
                                         <>
                                             <div className="relative z-10">
                                                 <span className="text-xs font-medium text-cangzhen-text-secondary tracking-widest uppercase border border-cangzhen-text-secondary/20 px-3 py-1 rounded-full">
                                                     {data.month}月 · Monthly
                                                 </span>
                                             </div>
                                             
                                             <div className="relative z-10 flex-1 flex flex-col justify-center items-center gap-4">
                                                 <div className={`w-24 h-24 rounded-full ${data.color} blur-2xl absolute`} />
                                                 <h2 className="text-4xl font-serif font-bold text-cangzhen-text-main relative z-10">
                                                     {data.keyword}
                                                 </h2>
                                             </div>

                                             <div className="relative z-10 flex justify-between items-end border-t border-cangzhen-text-secondary/10 pt-4">
                                                 <div className="flex flex-col">
                                                     <span className="text-2xl font-light text-cangzhen-text-main font-serif">{data.count}</span>
                                                     <span className="text-[10px] text-cangzhen-text-secondary uppercase">Memories</span>
                                                 </div>
                                                 <div className="w-8 h-8 rounded-full bg-cangzhen-text-main/5 flex items-center justify-center group-hover:bg-cangzhen-text-main/10 transition-colors">
                                                     <ChevronRight size={14} className="text-cangzhen-text-main" />
                                                 </div>
                                             </div>
                                         </>
                                     ) : (
                                         <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-60">
                                             <div className="w-12 h-12 rounded-full border-2 border-dashed border-cangzhen-text-secondary/30 flex items-center justify-center">
                                                 <span className="text-lg font-serif text-cangzhen-text-secondary/50">{data.month}</span>
                                             </div>
                                             <span className="text-xs text-cangzhen-text-secondary/50 tracking-widest">
                                                 {data.isActive ? '暂无内容' : '未开启'}
                                             </span>
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </div>
                         {/* Scroll Hint */}
                         <div className="flex justify-center gap-2 mt-4">
                             {monthlyData.map((_, i) => (
                                 <div 
                                     key={i} 
                                     className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentMonth - 1 ? 'bg-cangzhen-text-main w-3' : 'bg-cangzhen-text-secondary/20'}`} 
                                 />
                             ))}
                         </div>
                    </>
                 )}

                 {/* Expanded Detail View */}
                 {expandedMonth && (
                    <div className="absolute inset-0 bg-[#F9F7F2] z-20 overflow-y-auto pb-24 animate-fade-in px-4 pt-4">
                         {/* Header */}
                         <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#F9F7F2]/90 backdrop-blur-md z-10 py-2">
                             <button onClick={() => setExpandedMonth(null)} className="p-2 rounded-full bg-white/50 hover:bg-white transition-all shadow-sm">
                                 <ChevronLeft size={20} className="text-cangzhen-text-main" />
                             </button>
                             <h2 className="text-lg font-serif font-bold text-cangzhen-text-main">{expandedMonth.month}月回顾</h2>
                             <div className="w-10" /> {/* Spacer */}
                         </div>

                         {/* AI Summary */}
                         <div className="mb-6">
                             <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest mb-3 px-2">月度总结</h3>
                             <div className="glass rounded-2xl p-6 relative">
                                 <Quote className="absolute top-4 left-4 text-cangzhen-text-main/10 w-6 h-6 fill-current transform -scale-x-100" />
                                 <p className="text-sm text-cangzhen-text-main/80 leading-loose font-serif text-justify indent-0 relative z-10">
                                     {expandedMonth.aiSummary}
                                 </p>
                             </div>
                         </div>

                         {/* Trend Chart */}
                         <div className="mb-6">
                             <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest mb-3 px-2">每日趋势</h3>
                             <div className="glass-convex rounded-2xl p-4 h-48 flex items-end justify-between gap-1 overflow-x-auto no-scrollbar">
                                 {expandedMonth.trend.map((val, i) => (
                                     <div key={i} className="flex-1 min-w-[8px] bg-cangzhen-text-main/10 rounded-t-sm relative group hover:bg-cangzhen-text-main/30 transition-all" style={{ height: `${(val/5)*100}%` }}>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         {/* Word Cloud */}
                         <div className="mb-6">
                             <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest mb-3 px-2">月度词云</h3>
                             <div className="glass rounded-2xl p-6 h-64 relative overflow-hidden flex items-center justify-center">
                                 <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48">
                                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                      </svg>
                                 </div>
                                 {expandedMonth.tags.map((tag, i) => {
                                     const pos = shapeLayouts['heart'][i] || { left: '50%', top: '50%' };
                                     const fontSize = tag.weight >= 4 ? 'text-xl font-bold' : tag.weight >= 3 ? 'text-sm font-medium' : 'text-xs opacity-80';
                                     return (
                                         <span 
                                           key={tag.text} 
                                           className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110 cursor-default
                                              ${fontSize} text-cangzhen-text-main drop-shadow-sm
                                           `}
                                           style={{ left: pos.left, top: pos.top }}
                                         >
                                             {tag.text}
                                         </span>
                                     );
                                 })}
                             </div>
                         </div>
                    </div>
                 )}
             </div>
          )}

          {/* CONTENT FOR YEARLY TAB */}
          {activeTab === 'yearly' && (
              <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
                  {/* Glass Grid Container */}
                  <div className="glass-concave p-8 rounded-[2rem] w-full max-w-md relative overflow-hidden shadow-inner bg-white/5">
                      
                      {/* Header */}
                      <div className="flex justify-between items-end mb-6 px-2">
                          <div>
                              <h2 className="text-2xl font-serif font-bold text-cangzhen-text-main">{currentYear}</h2>
                              <span className="text-[10px] text-cangzhen-text-secondary uppercase tracking-[0.2em] opacity-60">Yearly Review</span>
                          </div>
                          <div className="text-right">
                               <div className="flex items-center gap-2 justify-end text-cangzhen-text-secondary/60 text-[10px] mb-1">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-[1px] border border-black/10 bg-white/10" />
                                        <span>未记录</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#F6D365] to-[#FDA085] shadow-[0_0_4px_rgba(246,211,101,0.6)]" />
                                        <span>已记录</span>
                                    </div>
                               </div>
                          </div>
                      </div>

                      {/* Grid of 365 days */}
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(12px,1fr))] gap-2 justify-center p-2">
                          {yearlyData.map((data, i) => (
                              <div 
                                  key={i}
                                  title={data.date.toLocaleDateString()}
                                  className={`
                                      w-3 h-3 transition-all duration-700 relative
                                      ${data.isLit 
                                          ? `${data.color} ${data.glow} scale-110 z-10 rounded-full` 
                                          : 'bg-black/5 hover:bg-black/10 scale-100 rounded-[2px]'}
                                  `}
                                  style={{ 
                                      opacity: data.isLit ? 1 : 0.4, // Increased opacity for empty cells
                                  }}
                              >
                                  {/* Glass Bead Effect Highlight (Only for Lit cells) */}
                                  {data.isLit && (
                                      <>
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-50 pointer-events-none" />
                                        <div className="absolute top-[1px] left-[2px] w-[3px] h-[1.5px] bg-white rounded-full blur-[0.5px] opacity-80" />
                                      </>
                                  )}
                              </div>
                          ))}
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cangzhen-sensation-main/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cangzhen-emotion-main/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                  </div>
                  
                  {/* Status Text */}
                  <div className="mt-8 flex flex-col items-center gap-3">
                      <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                          <Gift size={14} className="text-cangzhen-text-secondary" />
                          <span className="text-xs text-cangzhen-text-secondary tracking-wide">
                              年度回顾将于 <span className="font-bold text-cangzhen-text-main">{currentYear + 1}年1月1日</span> 开启
                          </span>
                      </div>
                      <p className="text-[10px] text-cangzhen-text-secondary/40 text-center max-w-[200px] leading-relaxed">
                          Every day matters. <br/> Keep recording to light up your year.
                      </p>
                  </div>
              </div>
          )}
          
      </div>
    </div>
  );
};

export default Review;
