import React, { useState, useEffect, useMemo } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';
import { storageService } from '../../services/storageService';
import { cangzhenService } from '../../services/cangzhenService';
import { supabaseCangzhen } from '../../services/authService';
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Quote, Cloud, Gift, X, Heart, Compass, Zap, Award, Calendar, Wand2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Review Page Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 h-screen overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Review Page Error</h2>
          <div className="bg-white p-4 rounded shadow border border-red-200 font-mono text-sm whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
            <br />
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ReviewContent = () => {
  // Rename localMemories to rawMemories to avoid any scope shadowing issues
  const [rawMemories, setRawMemories] = useState([]);
  
  const [activeTab, setActiveTab] = useState('monthly'); // monthly, yearly
  const [mounted, setMounted] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // New State for Glass Box Animation
  const [isBadgeWallExpanded, setIsBadgeWallExpanded] = useState(false); // Badge Wall State
  const [expandedMonth, setExpandedMonth] = useState(null); // Expanded Month View
  const [selectedBadge, setSelectedBadge] = useState(null); // Badge Detail Modal

  // --- 1. Defensive Data Processing (Robustness) ---
  
  // Safe Date Parsing Utility
  const safeParseDate = (input) => {
      if (!input) return null;
      // If it's a number (timestamp)
      if (typeof input === 'number') {
          const d = new Date(input);
          return isNaN(d.getTime()) ? null : d;
      }
      // If it's a date object
      if (input instanceof Date) {
          return isNaN(input.getTime()) ? null : input;
      }
      // If it's a string
      if (typeof input === 'string') {
          // Try standard parse first
          let d = new Date(input);
          if (!isNaN(d.getTime())) return d;
          
          // Try "MM月DD日" format (Assume current year)
          const match = input.match(/(\d+)月(\d+)日/);
          if (match) {
              const now = new Date();
              d = new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]));
              if (!isNaN(d.getTime())) return d;
          }
      }
      return null;
  };

  // Sanitized Memories: Filter out invalid entries once
  const sanitizedMemories = useMemo(() => {
      if (!Array.isArray(rawMemories)) return [];
      return rawMemories.filter(m => {
          if (!m) return false;
          const validDate = safeParseDate(m.id) || safeParseDate(m.date);
          return !!validDate;
      }).map(m => ({
          ...m,
          _parsedDate: safeParseDate(m.id) || safeParseDate(m.date)
      }));
  }, [rawMemories]);

  // Badges Data (Dynamic based on record COUNT)
  const badges = useMemo(() => {
      const totalCount = sanitizedMemories.length;
      
      // Define Milestones & Metadata (Same as Record.jsx)
      const definitions = [
          { id: 1, threshold: 1, name: '初见·萌芽', icon: 'sprout', plant: 'StarOfBethlehem', realPlantName: '伯利恒之星', displayName: '初见', meaning: '初见', desc: '清透如月光的温柔花材，带着初见的纯净与美好。恭喜你开启第一段真实记录，愿每一次落笔，都被时光温柔珍藏。', color: 'bg-[#D6CEAB]', mainColor: '#D6CEAB' },
          { id: 2, threshold: 3, name: '坚持·苏醒', icon: 'leaf', plant: 'Snowdrop', realPlantName: '雪滴花', displayName: '苏醒', meaning: '坚定', desc: '冰雪中绽放的坚韧小花，温柔却有力量。谢谢你坚持记录，每一次认真生活的瞬间，都值得被看见。', color: 'bg-[#A0C4A0]', mainColor: '#A0C4A0' },
          { id: 3, threshold: 7, name: '习惯·破土', icon: 'bud', plant: 'Lily', realPlantName: '百合', displayName: '破土', meaning: '微光', desc: '高原上的清雅花朵，自带清冷高级气质。坚持一周的你超棒，生活的微光，正被你一一拾起。', color: 'bg-[#F4D0D8]', mainColor: '#F4D0D8' },
          { id: 4, threshold: 10, name: '光亮·前行', icon: 'flower', plant: 'Iris', realPlantName: '鸢尾花', displayName: '前行', meaning: '光亮', desc: '花形如蝶，优雅灵动。十次记录，是热爱的开始，愿你在文字里，始终遇见内心的光亮。', color: 'bg-[#9D84B7]', mainColor: '#9D84B7' },
          { id: 5, threshold: 21, name: '蜕变·绽放', icon: 'flower', plant: 'Lotus', realPlantName: '莲花', displayName: '绽放', meaning: '笃定', desc: '上古灵草，羽叶清雅，自带沉稳力量。21 次坚持，习惯已成自然，恭喜你，与更笃定的自己相遇。', color: 'bg-[#C4BAD0]', mainColor: '#C4BAD0' },
          { id: 6, threshold: 30, name: '繁花·盛景', icon: 'bouquet', plant: 'custom', realPlantName: '满天星', displayName: '繁花', meaning: '温柔', desc: '朦胧轻盈的治愈之花。一个月的陪伴，谢谢你认真记录生活，每一段日常都因你变得柔软珍贵。', color: 'bg-[#E0D8C8]', mainColor: '#E0D8C8' }
      ];

      return definitions.map(def => ({
          ...def,
          count: totalCount,
          unlocked: totalCount >= def.threshold,
          date: null 
      }));
  }, [sanitizedMemories]);
  
  // State for AI-generated Monthly Summary
  const [monthlySummary, setMonthlySummary] = useState({
      loading: false,
      content: null,
      keyword: null,
      tags: []
  });

  useEffect(() => {
    setMounted(true);
    
    // Load memories...
    const loadMemoriesFromStorage = async () => {
        const stored = await storageService.getCangzhenMemories();
        if (stored && stored.length > 0) {
            setRawMemories(stored);
        } else {
            setRawMemories([]);
        }
    };
    
    loadMemoriesFromStorage();
    
    // Listen for storage changes
    const handleStorageChange = () => loadMemoriesFromStorage();
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Re-run once on mount

  // Separate Effect for AI Generation to ensure rawMemories is ready
  useEffect(() => {
      if (!expandedMonth || sanitizedMemories.length === 0) return;

      const currentMonth = new Date().getMonth() + 1;
      const monthOffset = expandedMonth.month - currentMonth;
      const monthId = `${new Date().getFullYear()}-M${expandedMonth.month}`;
      const cachedSummary = localStorage.getItem(`monthly_summary_${monthId}`);
      
      if (cachedSummary) {
          try {
              const parsed = JSON.parse(cachedSummary);
              setMonthlySummary({ loading: false, content: parsed.summary, keyword: parsed.keyword, tags: parsed.tags || [] });
          } catch(e) {
              setMonthlySummary({ loading: false, content: null, keyword: null, tags: [] });
          }
      } else {
          setMonthlySummary(prev => ({ ...prev, loading: true, content: null }));
          
          const fetchMonthlySummary = async () => {
              try {
                  const result = await cangzhenService.report_monthly(null, monthOffset);
                  if (result.success) {
                      localStorage.setItem(`monthly_summary_${monthId}`, JSON.stringify(result));
                  }
                  setMonthlySummary({ loading: false, content: result.summary, keyword: result.keyword, tags: result.tags });
              } catch (e) {
                  console.error("Fetch Monthly Summary Error", e);
                  setMonthlySummary({ loading: false, content: "<p>生成失败，请稍后重试。</p>", keyword: "沉淀", tags: [] });
              }
          };
          
          fetchMonthlySummary();
      }
  }, [expandedMonth, sanitizedMemories]); 


  // Real Data for Monthly Review
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const today = new Date();
  
  const monthlyData = useMemo(() => {
      return Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isActive = month <= currentMonth; // Active if past or current month
          
          // Calculate Real Count
          const monthMemories = sanitizedMemories.filter(m => {
             const mDate = m._parsedDate;
             return mDate.getMonth() + 1 === month && mDate.getFullYear() === today.getFullYear();
          });
          const count = monthMemories.length;
          
          let isOpen = count > 0;
          const hasContent = isActive && isOpen;
          
          let keyword = '';
          if (month === 1) keyword = '萌芽';
          else if (month === 2) keyword = '喜悦';
          else if (month === 3) keyword = '探索'; 
          else keyword = '未知'; 

          // Morandi Gradients
          const gradients = [
              'from-[#F1F2B5]/40 to-[#135058]/10', 
              'from-[#E0EAFC]/40 to-[#CFDEF3]/40', 
              'from-[#D4FC79]/20 to-[#96E6A1]/20', 
              'from-[#84fab0]/20 to-[#8fd3f4]/20', 
              'from-[#cfd9df]/40 to-[#e2ebf0]/40', 
              'from-[#a8edea]/30 to-[#fed6e3]/30', 
              'from-[#f5f7fa]/60 to-[#c3cfe2]/40', 
              'from-[#e0c3fc]/30 to-[#8ec5fc]/30', 
              'from-[#f093fb]/20 to-[#f5576c]/20', 
              'from-[#4facfe]/20 to-[#00f2fe]/20', 
              'from-[#43e97b]/20 to-[#38f9d7]/20', 
              'from-[#fa709a]/20 to-[#fee140]/20', 
          ];
          
          const gradient = gradients[i % gradients.length];

          // Calculate Trend
          const daysInMonth = new Date(today.getFullYear(), month, 0).getDate();
          const trend = Array(daysInMonth).fill(0);
          monthMemories.forEach(m => {
              const mDate = m._parsedDate;
              const d = mDate.getDate();
              if (d >= 1 && d <= daysInMonth) trend[d-1]++;
          });

          return {
              month,
              isActive,
              hasContent, // Controls clickable state
              keyword,
              gradient,
              color: hasContent ? `bg-gradient-to-br from-[#FF9A9E]/20 to-[#FECFEF]/20` : 'bg-white/5',
              count: count,
              trend: trend,
              tags: [] 
          };
      });
  }, [sanitizedMemories, currentMonth]);


  // Yearly Review - Optimized O(N) lookup
  const currentYear = new Date().getFullYear();
  const daysInYear = ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) ? 366 : 365;
  
  // Create a Set of "MM-DD" strings for O(1) lookup
  const activeDaysSet = useMemo(() => {
      const set = new Set();
      sanitizedMemories.forEach(m => {
          const mDate = m._parsedDate;
          if (mDate.getFullYear() === currentYear) {
              const key = `${mDate.getMonth()}-${mDate.getDate()}`; // "0-1" for Jan 1st (0-indexed month)
              set.add(key);
          }
      });
      return set;
  }, [sanitizedMemories, currentYear]);

  const yearlyData = useMemo(() => {
      return Array.from({ length: daysInYear }, (_, i) => {
          const date = new Date(currentYear, 0, i + 1); // Jan 1st + i days
          const key = `${date.getMonth()}-${date.getDate()}`;
          const isLit = activeDaysSet.has(key);

          // Determine color
          let beadColor = 'bg-white/5'; 
          let beadGlow = '';
          
          if (isLit) {
              beadColor = 'bg-gradient-to-br from-[#F6D365] to-[#FDA085]'; 
              beadGlow = 'shadow-[0_0_8px_rgba(246,211,101,0.6)]';
          }

          return {
              day: i + 1,
              date: date,
              isLit: isLit,
              color: beadColor,
              glow: beadGlow,
              intensity: isLit ? 0.9 + Math.random() * 0.1 : 0 
          };
      });
  }, [daysInYear, activeDaysSet, currentYear]);

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

  const getShapePos = (shape, index) => {
     const layout = shapeLayouts[shape] || shapeLayouts.heart;
     // Safe Access with Modulo to prevent out-of-bounds
     return layout[index % layout.length] || { left: '50%', top: '50%' };
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9F7F2] font-serif overflow-hidden">
      
      {/* 1. Header with Tabs */}
      <header className="pt-6 pb-4 flex items-center px-6 shrink-0 z-20">
        <div className="flex-1">
        </div>
        <div className="glass-concave p-1 rounded-full flex gap-1 bg-white/30 backdrop-blur-md">
            {['monthly', 'yearly'].map(tab => (
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
                        {tab === 'monthly' ? '月回顾' : '年回顾'}
                    </span>
                </button>
            ))}
        </div>
        <div className="flex-1"></div>
      </header>

      {/* 2. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 space-y-6 scrollbar-hide">
          
          {/* CONTENT FOR MONTHLY TAB */}
          {activeTab === 'monthly' && (
             <div className="flex-1 h-full flex flex-col relative">
                 {/* Standard View: Double Column Grid */}
                 {!expandedMonth && (
                    <div className="w-full px-6 pt-4 pb-24 grid grid-cols-2 gap-4 animate-fade-in">
                         {monthlyData.map((data, i) => (
                             <div 
                                 key={i}
                                 onClick={() => data.hasContent && setExpandedMonth(data)}
                                 className={`
                                    aspect-square rounded-[1.5rem] relative overflow-hidden transition-all duration-500 flex flex-col justify-between p-5 group
                                    ${data.hasContent 
                                        ? 'glass-convex shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer bg-white/40 border border-white/40' 
                                        : `glass-concave cursor-not-allowed bg-gradient-to-br ${data.gradient} border border-white/20 opacity-90`}
                                 `}
                             >
                                 {/* Background Decor */}
                                 {data.hasContent && (
                                     <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${data.color} blur-2xl opacity-60 group-hover:opacity-80 transition-opacity`} />
                                 )}

                                 {/* Header: Month & Arrow */}
                                 <div className="flex justify-between items-start relative z-10">
                                     <span className={`text-3xl font-serif font-bold ${data.hasContent ? 'text-cangzhen-text-main' : 'text-cangzhen-text-secondary/50'}`}>
                                         {data.month} <span className="text-[10px] font-sans font-normal opacity-60">月</span>
                                     </span>
                                     {data.hasContent && (
                                         <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center backdrop-blur-sm shadow-sm">
                                             <ChevronRight size={14} className="text-cangzhen-text-secondary" />
                                         </div>
                                     )}
                                 </div>

                                 {/* Content: Keyword & Count */}
                                 {data.hasContent ? (
                                     <div className="relative z-10 flex-1 flex flex-col justify-center items-center gap-2">
                                         <h3 className="text-2xl font-serif font-bold text-cangzhen-text-main tracking-widest drop-shadow-sm">
                                             {data.keyword}
                                         </h3>
                                         <span className="inline-block px-3 py-1 rounded-full bg-white/60 border border-white/40 backdrop-blur-sm text-[10px] text-cangzhen-text-secondary/80 font-medium tracking-wider shadow-sm">
                                             {data.count} 馆藏
                                         </span>
                                     </div>
                                 ) : (
                                     <div className="flex-1 flex items-center justify-center">
                                         <span className="text-[10px] text-cangzhen-text-secondary/40 tracking-widest uppercase rotate-90 origin-center whitespace-nowrap">
                                             Coming Soon
                                         </span>
                                     </div>
                                 )}
                             </div>
                         ))}
                    </div>
                 )}

                 {/* Expanded Detail View */}
                 {expandedMonth && (
                    <div className="absolute inset-0 bg-[#F9F7F2] z-20 overflow-y-auto pb-24 animate-fade-in px-4 pt-4">
                         {/* Header */}
                         <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#F9F7F2]/90 backdrop-blur-md z-10 py-2">
                             <button onClick={() => setExpandedMonth(null)} className="p-2 rounded-full bg-white/50 hover:bg-white transition-all shadow-sm">
                                 <ChevronLeft size={20} className="text-cangzhen-text-main" />
                             </button>
                             <h2 className="text-lg font-serif font-bold text-cangzhen-text-main">{expandedMonth.month}月珍藏</h2>
                             <div className="w-10" /> {/* Spacer */}
                         </div>

                         {/* AI Summary */}
                         <div className="mb-6">
                             <div className="glass rounded-2xl p-6 relative">
                                 <Quote className="absolute top-4 left-4 text-cangzhen-text-main/10 w-6 h-6 fill-current transform -scale-x-100" />
                                 <div className="text-sm text-cangzhen-text-main/80 leading-loose font-serif text-justify indent-0 relative z-10">
                                     {monthlySummary.loading ? (
                                         <div className="animate-pulse space-y-2">
                                             <div className="h-4 bg-black/5 rounded w-3/4"></div>
                                             <div className="h-4 bg-black/5 rounded w-full"></div>
                                             <div className="h-4 bg-black/5 rounded w-5/6"></div>
                                         </div>
                                     ) : (
                                         monthlySummary.content ? (
                                             <div dangerouslySetInnerHTML={{ __html: monthlySummary.content }} />
                                         ) : (
                                             <p>暂无本月详细分析报告，请继续保持记录习惯。</p>
                                         )
                                     )}
                                 </div>
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
                                 {/* Use AI tags if available, otherwise use a fallback or placeholder */}
                                 {(monthlySummary.tags && monthlySummary.tags.length > 0 ? monthlySummary.tags : [
                                     {text: expandedMonth.keyword || '沉淀', weight: 5},
                                     {text: '记录', weight: 3},
                                     {text: '生活', weight: 4},
                                     {text: '日常', weight: 2}
                                 ]).map((tag, i) => {
                                     const pos = getShapePos('heart', i);
                                     // Safe Access
                                     if (!tag || !tag.text) return null;
                                     const weight = tag.weight || 1;
                                     const fontSize = weight >= 4 ? 'text-xl font-bold' : weight >= 3 ? 'text-sm font-medium' : 'text-xs opacity-80';
                                     
                                     return (
                                         <span 
                                           key={`${tag.text}-${i}`} 
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
             <div className="flex-1 h-full flex flex-col relative overflow-y-auto scrollbar-hide pb-24">
                 
                 {/* 1. Badge Wall Section */}
                 <div className={`w-full px-6 transition-all duration-500 relative ${isBadgeWallExpanded ? 'mb-8' : 'mb-4'} mt-4 shrink-0`}>
                     {/* Added Background Decoration for Badge Wall - Tender Green to Light Yellow Gradient */}
                     <div className="absolute inset-x-2 -top-4 -bottom-4 bg-gradient-to-br from-[#E8F5E9] via-[#FDF6E3] to-[#F0E8DD] rounded-[2rem] opacity-90 blur-2xl pointer-events-none" />
                     
                     <div className="flex items-center justify-between mb-4 relative z-10">
                         <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest flex items-center gap-2">
                             <Award size={14} /> 惊喜馆藏 · Collection
                         </h3>
                         <button 
                            onClick={() => setIsBadgeWallExpanded(!isBadgeWallExpanded)}
                            className="text-[10px] text-cangzhen-text-secondary/60 hover:text-cangzhen-text-main transition-colors bg-white/20 px-2 py-1 rounded-full"
                         >
                             {isBadgeWallExpanded ? '收起' : '全部'}
                         </button>
                     </div>
                     
                     <div className={`grid grid-cols-4 gap-4 transition-all duration-500 overflow-hidden ${isBadgeWallExpanded ? 'max-h-[1000px]' : 'max-h-[160px]'} justify-items-center relative z-10 px-2`}>
                         {badges.map(badge => (
                             <div 
                                key={badge.id}
                                onClick={() => badge.unlocked && setSelectedBadge(badge)}
                                className="flex flex-col items-center gap-2 group relative cursor-pointer"
                             >
                                 {/* Glass Sphere Container (Lighter & More Transparent) */}
                                 <div className={`
                                     relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500
                                     ${badge.unlocked 
                                         ? 'shadow-sm bg-white/20 backdrop-blur-md border border-white/30 hover:scale-110 hover:shadow-md hover:bg-white/30' 
                                         : 'opacity-40 bg-white/5 border border-white/10 shadow-inner grayscale'}
                                 `}>
                                     {/* Light Reflection (Top Left) */}
                                     {badge.unlocked && (
                                         <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-gradient-to-br from-white/40 to-transparent rounded-full opacity-60 blur-[2px]" />
                                     )}
                                     
                                     {/* Plant Icon */}
                                     <div className={`relative z-10 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-sm ${!badge.unlocked && 'opacity-30 blur-[1px]'}`}>
                                         <FlowerIcon type={badge.plant} size={28} />
                                     </div>
                                 </div>

                                 {/* Label Info (Outside Sphere) */}
                                 <div className="text-center transition-all duration-300">
                                     {badge.unlocked ? (
                                         <>
                                            <h4 className="text-[10px] font-serif font-bold text-cangzhen-text-main tracking-widest mb-0.5 group-hover:text-black transition-colors">
                                                {badge.displayName}
                                            </h4>
                                            <span className="text-[8px] text-cangzhen-text-secondary/80 block tracking-wide">
                                                {badge.meaning}
                                            </span>
                                         </>
                                     ) : (
                                         <>
                                            {/* Locked State: Only show meaning (2 chars) */}
                                            <h4 className="text-[10px] font-serif font-bold text-transparent tracking-widest mb-0.5 select-none" aria-hidden="true">
                                                ???
                                            </h4>
                                            <span className="text-[8px] text-cangzhen-text-secondary/40 block tracking-wide font-medium">
                                                {badge.meaning}
                                            </span>
                                         </>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                     {/* Fade overlay if collapsed */}
                     {!isBadgeWallExpanded && (
                         <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F9F7F2] to-transparent pointer-events-none" />
                     )}
                 </div>

                 {/* Badge Detail Modal */}
                 {selectedBadge && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedBadge(null)}>
                        <div 
                            className="w-full max-w-xs bg-[#F9F7F2] rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in relative border border-white/60 p-8 flex flex-col items-center text-center"
                            onClick={e => e.stopPropagation()}
                        >
                             {/* Close Button */}
                             <button 
                                onClick={() => setSelectedBadge(null)}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-cangzhen-text-secondary transition-colors"
                            >
                                <X size={16} />
                            </button>

                            {/* Large Icon */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-[#F0F0F0] shadow-[inset_0_2px_10px_rgba(0,0,0,0.05),0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center mb-6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-50" />
                                <div className="relative z-10 transform scale-150">
                                    <FlowerIcon type={selectedBadge.plant} size={48} />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-serif font-bold text-cangzhen-text-main mb-1 tracking-widest">
                                {selectedBadge.realPlantName}
                            </h2>
                            <span className="text-xs text-cangzhen-text-secondary/60 uppercase tracking-[0.2em] mb-6 block">
                                {selectedBadge.meaning}
                            </span>

                            {/* Description */}
                            <div className="relative">
                                <Quote className="absolute -top-3 -left-2 text-cangzhen-text-main/10 w-6 h-6 fill-current transform -scale-x-100" />
                                <p className="text-sm text-cangzhen-text-main/80 leading-relaxed font-serif px-2">
                                    {selectedBadge.desc}
                                </p>
                                <Quote className="absolute -bottom-3 -right-2 text-cangzhen-text-main/10 w-6 h-6 fill-current" />
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-4 border-t border-black/5 w-full">
                                <span className="text-[10px] text-cangzhen-text-secondary/40 uppercase tracking-widest">
                                    Cangzhen Collection
                                </span>
                            </div>
                        </div>
                    </div>
                 )}

                 {/* 2. Yearly Grid (365 Days) */}
                 <div className="px-6 flex-1 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest flex items-center gap-2">
                              <Calendar size={14} /> 365 · Days
                          </h3>
                          <div className="flex items-center gap-2 justify-end text-cangzhen-text-secondary/60 text-[10px]">
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

                      {/* Glass Grid Container */}
                      <div className="glass-concave p-6 rounded-[2rem] w-full relative overflow-hidden shadow-inner bg-white/5">
                          <div className="flex justify-between items-end mb-4 px-2">
                              <div>
                                  <h2 className="text-2xl font-serif font-bold text-cangzhen-text-main">{currentYear}</h2>
                              </div>
                          </div>

                          <div className="grid grid-cols-[repeat(auto-fit,minmax(10px,1fr))] gap-1.5 justify-center p-1">
                              {yearlyData.map((data, i) => (
                                  <div 
                                      key={i}
                                      title={data.date.toLocaleDateString()}
                                      className={`
                                          w-2.5 h-2.5 transition-all duration-700 relative
                                          ${data.isLit 
                                              ? `${data.color} ${data.glow} scale-110 z-10 rounded-full` 
                                              : 'bg-black/5 hover:bg-black/10 scale-100 rounded-[2px]'}
                                      `}
                                      style={{ 
                                          opacity: data.isLit ? 1 : 0.4, 
                                      }}
                                  >
                                      {data.isLit && (
                                          <>
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-50 pointer-events-none" />
                                            <div className="absolute top-[1px] left-[2px] w-[3px] h-[1.5px] bg-white rounded-full blur-[0.5px] opacity-80" />
                                          </>
                                      )}
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      {/* Status Text */}
                      <div className="mt-8 flex flex-col items-center gap-3 mb-8">
                          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                              <Gift size={14} className="text-cangzhen-text-secondary" />
                              <span className="text-xs text-cangzhen-text-secondary tracking-wide">
                                  年度回顾将于 <span className="font-bold text-cangzhen-text-main">{currentYear + 1}年1月1日</span> 开启
                              </span>
                          </div>
                      </div>
                 </div>
             </div>
          )}
          
      </div>
    </div>
  );
};

export default function ReviewWrapper() {
  return (
    <ErrorBoundary>
      <ReviewContent />
    </ErrorBoundary>
  );
};