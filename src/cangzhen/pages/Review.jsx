import React, { useState, useEffect, useMemo } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';
import { healthService } from '../../services/healthService';
import { ChevronLeft, ChevronRight, TrendingUp, Sparkles, Quote, Cloud, Gift, X, Heart, Compass, Zap, Award, Calendar } from 'lucide-react';

const Review = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // weekly, monthly, yearly
  const [mounted, setMounted] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // New State for Glass Box Animation
  const [isBadgeWallExpanded, setIsBadgeWallExpanded] = useState(false); // Badge Wall State
  const [expandedMonth, setExpandedMonth] = useState(null); // Expanded Month View

  // Badges Data (Dynamic based on real count)
  const badges = useMemo(() => {
      const totalCount = localMemories.length;
      
      // Define Milestones & Metadata
      const definitions = [
          { id: 1, threshold: 1, name: '初见·萌芽', icon: 'sprout', plant: 'Snowdrop', plantNameCN: '雪滴花', meaning: '希望', color: 'bg-[#D6CEAB]', mainColor: '#D6CEAB' },
          { id: 2, threshold: 3, name: '坚持·苏醒', icon: 'leaf', plant: 'Rosemary', plantNameCN: '迷迭香', meaning: '回忆', color: 'bg-[#A0C4A0]', mainColor: '#A0C4A0' },
          { id: 3, threshold: 7, name: '习惯·破土', icon: 'bud', plant: 'Lily', plantNameCN: '铃兰', meaning: '幸福归来', color: 'bg-[#F4D0D8]', mainColor: '#F4D0D8' },
          { id: 4, threshold: 21, name: '蜕变·绽放', icon: 'flower', plant: 'Lotus', plantNameCN: '睡莲', meaning: '悟性', color: 'bg-[#C4BAD0]', mainColor: '#C4BAD0' },
          { id: 5, threshold: 50, name: '繁花·盛景', icon: 'bouquet', plant: 'custom', plantNameCN: '满天星', meaning: '思念', color: 'bg-[#E0D8C8]', mainColor: '#E0D8C8' },
          { id: 6, threshold: 100, name: '百日·森林', icon: 'tree', plant: 'custom', plantNameCN: '橡树', meaning: '永恒', color: 'bg-[#8F9E78]', mainColor: '#8F9E78' },
      ];

      return definitions.map(def => ({
          ...def,
          count: totalCount, // Current total
          unlocked: totalCount >= def.threshold,
          date: null // Ideally we would store unlock date in localStorage too, but for now derive from count
      }));
  }, [localMemories]);

  const [localMemories, setLocalMemories] = useState([]);
  
  // Weekly Review State
  const [weekOffset, setWeekOffset] = useState(0); // 0 = Current Week, -1 = Last Week
  const [isWeekLocked, setIsWeekLocked] = useState(true);

  // Helper to get week ID for persistence (e.g. "2026-W10")
  const getWeekId = (offset) => {
      const now = new Date();
      const currentDay = now.getDay(); 
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff + (offset * 7));
      
      // ISO Week Number logic (simplified)
      const oneJan = new Date(startOfWeek.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((startOfWeek - oneJan) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((startOfWeek.getDay() + 1 + numberOfDays) / 7);
      return `${startOfWeek.getFullYear()}-W${weekNum}`;
  };

  // State for AI-generated Weekly Summary
  const [weeklySummary, setWeeklySummary] = useState({
      loading: false,
      content: null,
      keyword: null
  });

  useEffect(() => {
    setMounted(true);
    
    // Check if current week is already opened
    if (weekOffset === 0) {
        const weekId = getWeekId(0);
        const isOpened = localStorage.getItem(`weekly_opened_${weekId}`);
        // If it's Monday 00:00+ (implied by weekOffset=0 logic) and NOT opened, it's locked.
        // If already opened, unlock it.
        if (isOpened === 'true') {
            setIsPaletteOpen(true); // "Open" state means the box is gone/revealed
        } else {
            setIsPaletteOpen(false); // Box is visible (Locked)
        }
    } else {
        setIsPaletteOpen(true); // Past weeks always open
    }

    // Load memories...
    const stored = localStorage.getItem('cangzhen_memories');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                setLocalMemories(parsed);
            } else {
                setLocalMemories([]);
            }
        } catch (e) {
            console.error("Failed to parse memories", e);
            setLocalMemories([]);
        }
    }

    // Trigger AI Generation if this is a PAST week or opened current week
    // We cache it by weekId to avoid re-generating every time
    const weekId = getWeekId(weekOffset);
    const cachedSummary = localStorage.getItem(`weekly_summary_${weekId}`);
    
    if (cachedSummary) {
        try {
            const parsed = JSON.parse(cachedSummary);
            setWeeklySummary({ loading: false, content: parsed.summary, keyword: parsed.keyword, tags: parsed.tags });
        } catch(e) {}
    } else {
        // Only generate if we have memories for this week
        // AND (it's a past week OR (current week and opened))
        // For simplicity, let's just generate if there are memories.
        
        // Wait for memories to be loaded first? localMemories might be empty on first render.
        // But we re-run this effect when weekOffset changes.
        // We need a separate effect or check inside data calculation.
    }

  }, [weekOffset]); // Re-run when switching weeks

  // Separate Effect for AI Generation to ensure localMemories is ready
  useEffect(() => {
      if (localMemories.length === 0) return;

      const weekId = getWeekId(weekOffset);
      const cachedSummary = localStorage.getItem(`weekly_summary_${weekId}`);
      
      // Calculate if we have memories for this week
      const now = new Date();
      const currentDay = now.getDay(); 
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff + (weekOffset * 7));
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      const hasMemories = localMemories.some(m => {
          const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
          return mDate >= startOfWeek && mDate <= endOfWeek;
      });

      if (hasMemories && !cachedSummary && !weeklySummary.loading && !weeklySummary.content) {
          setWeeklySummary(prev => ({ ...prev, loading: true }));
          
          try {
               healthService.report_weekly('user', weekOffset).then(res => {
                   if (res.success) {
                       const result = { summary: res.summary, keyword: res.keyword, tags: res.tags };
                       localStorage.setItem(`weekly_summary_${weekId}`, JSON.stringify(result));
                       setWeeklySummary({ loading: false, content: res.summary, keyword: res.keyword, tags: res.tags });
                   } else {
                       setWeeklySummary({ loading: false, content: res.summary, keyword: res.keyword, tags: res.tags });
                   }
               }).catch(e => {
                   console.error("Weekly Report Error:", e);
                   setWeeklySummary({ loading: false, content: "生成报告时发生错误，请稍后重试。" });
               });
          } catch (e) {
               console.error("Weekly Report Sync Error:", e);
               setWeeklySummary({ loading: false, content: "生成报告时发生错误，请稍后重试。" });
          }
      }
  }, [weekOffset, localMemories]); // Depend on memories too


  // Handle Box Open
  const handleOpenBox = () => {
      setIsPaletteOpen(true);
      if (weekOffset === 0) {
          const weekId = getWeekId(0);
          localStorage.setItem(`weekly_opened_${weekId}`, 'true');
      }
  };

  // Mock Data for Weekly Review (Dynamic based on offset)
  const weeklyData = useMemo(() => {
      // ... (Date Range Logic same as before)
      const now = new Date();
      const currentDay = now.getDay(); 
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Monday
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff + (weekOffset * 7));
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      
      const format = (d) => `${d.getMonth() + 1}月${d.getDate()}日`;
      const dateRangeStr = `${format(startOfWeek)} - ${format(endOfWeek)}`;

      // Calculate Real Stats from localMemories
      const weekMemories = localMemories.filter(m => {
          if (!m) return false;
          const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
          // Handle potential invalid date
          if (isNaN(mDate.getTime())) return false;
          return mDate >= startOfWeek && mDate <= endOfWeek;
      });
      
      const totalMemories = weekMemories.length;

      // Calculate Daily Trend (Mon-Sun)
      const trend = Array(7).fill(0);
      weekMemories.forEach(m => {
          if (!m) return;
          const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
          if (isNaN(mDate.getTime())) return;
          
          // getDay: 0=Sun, 1=Mon... we want 0=Mon, 6=Sun
          let dayIndex = mDate.getDay() - 1;
          if (dayIndex === -1) dayIndex = 6;
          trend[dayIndex]++;
      });

      // Calculate Top Keyword based on Hall Usage (Simple Heuristic for fallback)
      const hallCountsMap = {
         sensation: 0, emotion: 0, inspiration: 0, wanxiang: 0
      };
      weekMemories.forEach(m => {
          if (m && m.hall && hallCountsMap[m.hall] !== undefined) hallCountsMap[m.hall]++;
      });
          
          // Generate Tags based on Hall distribution if API tags are missing
          let fallbackTags = [];
          if (hallCountsMap.sensation > 0) fallbackTags.push({ text: '感知', weight: Math.min(5, hallCountsMap.sensation) });
          if (hallCountsMap.emotion > 0) fallbackTags.push({ text: '情绪', weight: Math.min(5, hallCountsMap.emotion) });
          if (hallCountsMap.inspiration > 0) fallbackTags.push({ text: '灵感', weight: Math.min(5, hallCountsMap.inspiration) });
          if (hallCountsMap.wanxiang > 0) fallbackTags.push({ text: '决策', weight: Math.min(5, hallCountsMap.wanxiang) });
          
          // Add some generic tags if empty
          if (totalMemories > 0 && fallbackTags.length < 3) {
             fallbackTags.push({ text: '记录', weight: 3 });
             fallbackTags.push({ text: '生活', weight: 2 });
          }
    
          const hallCounts = [
              { id: 'sensation', name: '感知', count: hallCountsMap.sensation, icon: 'flower' },
              { id: 'emotion', name: '情绪', count: hallCountsMap.emotion, icon: 'heart' },
              { id: 'inspiration', name: '创意', count: hallCountsMap.inspiration, icon: 'zap' },
              { id: 'wanxiang', name: '决策', count: hallCountsMap.wanxiang, icon: 'compass' },
          ];
    
          // Return Data Object
          const isEven = Math.abs(weekOffset) % 2 === 0;
          return {
              status: weekOffset === 0 ? 'locked' : 'unlocked', // logic for "locked" vs "unlocked" mainly affects the "Mystery Box" UI wrapper
              dateRange: dateRangeStr,
              keyword: isEven ? 'Courage' : 'Healing',
              keywordCN: weeklySummary.keyword || (totalMemories > 0 ? (isEven ? '勇气' : '治愈') : '空白'),
              keywordMeaning: isEven ? 'Facing the unknown with a smile.' : 'The art of stitching the soul with time.',
              bgGradient: isEven ? 'bg-gradient-to-br from-[#F6D365] to-[#FDA085]' : 'bg-gradient-to-br from-[#E0E7D8] to-[#F5F7F0]',
              bgImage: isEven 
                ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop' 
                : 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2787&auto=format&fit=crop',
              moodShadow: isEven ? 'shadow-orange-100' : 'shadow-green-100',
              count: totalMemories,
              aiSummary: weeklySummary.loading ? (
                 <div className="animate-pulse space-y-2">
                     <div className="h-4 bg-black/5 rounded w-3/4"></div>
                     <div className="h-4 bg-black/5 rounded w-full"></div>
                     <div className="h-4 bg-black/5 rounded w-5/6"></div>
                 </div>
              ) : (weeklySummary.content ? (
                 <div dangerouslySetInnerHTML={{ __html: weeklySummary.content }} />
              ) : (
                <>
                    <strong>{startOfWeek.getMonth() + 1}月·周复盘</strong><br/><br/>
                    {weekOffset === 0 
                        ? "本周还在进行中，记录还在生长..." 
                        : "暂无足够数据生成详细报告，请多记录一些日常吧。"}
                </>
              )),
              trend: trend, // REAL DATA
              tags: weeklySummary.tags && weeklySummary.tags.length > 0 ? weeklySummary.tags : fallbackTags, // Use AI tags or Fallback
              shape: isEven ? 'heart' : 'drop',
              progress: trend, // Use same real trend for progress dots
              daysLeft: 7 - (new Date().getDay() || 7),
              hallCounts: hallCounts
          };
      }, [weekOffset, localMemories, weeklySummary]); // Depend on weeklySummary too to update tags/keywords

  // Real Data for Monthly Review
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  const monthlyData = useMemo(() => {
      return Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const isActive = month <= currentMonth; // Active if past or current month
          
          // Calculate Real Count
          const monthMemories = localMemories.filter(m => {
             if (!m) return false;
             const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
             if (isNaN(mDate.getTime())) return false;
             return mDate.getMonth() + 1 === month && mDate.getFullYear() === new Date().getFullYear();
          });
          const count = monthMemories.length;
          const hasContent = isActive && count > 0;
          
          let keyword = '';
          if (month === 1) keyword = '萌芽';
          else if (month === 2) keyword = '喜悦';
          else if (month === 3) keyword = '探索'; // March default
          else keyword = '未知'; // Default for empty

          // Morandi Gradients (Muted, Elegant)
          const gradients = [
              'from-[#F1F2B5]/40 to-[#135058]/10', // 1. Vintage Yellow/Green
              'from-[#E0EAFC]/40 to-[#CFDEF3]/40', // 2. Soft Blue
              'from-[#D4FC79]/20 to-[#96E6A1]/20', // 3. Fresh Green
              'from-[#84fab0]/20 to-[#8fd3f4]/20', // 4. Teal/Blue
              'from-[#cfd9df]/40 to-[#e2ebf0]/40', // 5. Silver/Blue
              'from-[#a8edea]/30 to-[#fed6e3]/30', // 6. Pink/Teal
              'from-[#f5f7fa]/60 to-[#c3cfe2]/40', // 7. Misty White
              'from-[#e0c3fc]/30 to-[#8ec5fc]/30', // 8. Purple/Blue
              'from-[#f093fb]/20 to-[#f5576c]/20', // 9. Pink/Red
              'from-[#4facfe]/20 to-[#00f2fe]/20', // 10. Bright Blue
              'from-[#43e97b]/20 to-[#38f9d7]/20', // 11. Green
              'from-[#fa709a]/20 to-[#fee140]/20', // 12. Red/Yellow
          ];
          
          const gradient = gradients[i % gradients.length];

          // Calculate Trend
          const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
          const trend = Array(daysInMonth).fill(0);
          monthMemories.forEach(m => {
              // Ensure we parse dates correctly, fallback to Date.now() if invalid to prevent NaN crash
              let d = 0;
              try {
                  const mDate = typeof m.id === 'number' ? new Date(m.id) : new Date(m.date);
                  // Check if valid date
                  if (!isNaN(mDate.getTime())) {
                      d = mDate.getDate();
                  } else {
                      // Attempt to parse "X月X日" format manually if needed, or skip
                      const match = m.date && typeof m.date === 'string' ? m.date.match(/(\d+)月(\d+)日/) : null;
                      if (match) d = parseInt(match[2]);
                  }
              } catch (e) {}

              if (d >= 1 && d <= daysInMonth) trend[d-1]++;
          });

          return {
              month,
              isActive,
              hasContent,
              keyword,
              gradient,
              color: hasContent ? `bg-gradient-to-br from-[#FF9A9E]/20 to-[#FECFEF]/20` : 'bg-white/5',
              count: count,
              aiSummary: (
                <>
                    <strong>{month}月·状态复盘</strong><br/><br/>
                    {count > 0 ? "暂无详细分析报告，请继续保持记录习惯。" : "本月暂无记录。"}
                </>
              ),
              trend: trend,
              tags: [] // Clear Mock Tags
          };
      });
  }, [localMemories, currentMonth]);


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
          if (!m) return false;
          
          // Check by Timestamp (if id is number)
          if (typeof m.id === 'number') {
              const mDate = new Date(m.id);
              if (isNaN(mDate.getTime())) return false;
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
    ],
    drop: [
      { left: '50%', top: '20%' }, // Tip
      { left: '35%', top: '40%' }, { left: '65%', top: '40%' }, // Upper body
      { left: '20%', top: '60%' }, { left: '80%', top: '60%' }, // Widest
      { left: '35%', top: '75%' }, { left: '65%', top: '75%' }, // Lower body
      { left: '50%', top: '85%' }, // Bottom
      { left: '50%', top: '50%' }, // Center
      { left: '50%', top: '65%' }, // Center Lower
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
      <div className="flex-1 overflow-y-auto pb-24 px-6 space-y-6 scrollbar-hide">
          
          {/* CONTENT FOR WEEKLY TAB */}
          {activeTab === 'weekly' && (
             <>
                {/* 1. Week Navigation */}
                <div className="flex items-center justify-between px-6 mb-4 relative z-10">
                    <button 
                        onClick={() => { setWeekOffset(prev => prev - 1); setIsPaletteOpen(false); }} 
                        className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all text-cangzhen-text-secondary"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-serif font-bold text-cangzhen-text-main tracking-wide">
                            {weeklyData.dateRange}
                        </span>
                        {weeklyData.status === 'locked' && (
                            <span className="text-[10px] text-cangzhen-text-secondary uppercase tracking-widest opacity-60">
                                Current Week
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={() => { setWeekOffset(prev => Math.min(prev + 1, 0)); setIsPaletteOpen(false); }} 
                        disabled={weekOffset === 0}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all text-cangzhen-text-secondary ${weekOffset === 0 ? 'opacity-30 cursor-not-allowed bg-transparent' : 'bg-white/20 hover:bg-white/40'}`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* 2. Main Card (Locked or Unlocked) */}
                <div className="relative w-full h-[160px]">

                    {weeklyData.status === 'locked' ? (
                        /* LOCKED STATE: Mystery Box */
                        <div 
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                                e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                            }}
                            className="absolute inset-0 w-full h-full rounded-xl overflow-hidden glass-concave shadow-inner flex flex-col items-center justify-center relative border border-white/20 group"
                        >
                            {/* Interactive Shine Layer (Press Effect) */}
                            <div 
                                className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: `radial-gradient(circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.3), transparent 60%)`,
                                    mixBlendMode: 'overlay'
                                }}
                            />

                            {/* 1. Background Image (Forest/Elegant) */}
                            <div className="absolute inset-0 bg-[#F2F0E9]">
                                <img 
                                    src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2948&auto=format&fit=crop" 
                                    alt="Forest Background" 
                                    className="w-full h-full object-cover opacity-80 mix-blend-multiply transition-transform duration-[20s] ease-in-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
                            </div>
                            
                            {/* 2. Floating Hall Bubbles (Home Page Texture) */}
                            <div className="absolute inset-0 pointer-events-none">
                                {weeklyData.hallCounts.map((hall, i) => (
                                    <div 
                                        key={hall.id}
                                        className="absolute w-11 h-11 rounded-[0.8rem] glass-convex border border-white/40 flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md animate-float cursor-default bg-white/20"
                                        style={{
                                            left: i === 0 ? '12%' : i === 1 ? '78%' : i === 2 ? '15%' : '75%',
                                            top: i === 0 ? '15%' : i === 1 ? '20%' : i === 2 ? '70%' : '65%',
                                            animationDelay: `${i * 1.5}s`,
                                            animationDuration: '7s'
                                        }}
                                    >
                                        <div className="text-cangzhen-text-main/80 mb-0.5 drop-shadow-sm">
                                            {hall.icon === 'flower' && <FlowerIcon type="sakura" className="w-3 h-3" />}
                                            {hall.icon === 'heart' && <Heart size={10} className="text-cangzhen-emotion-main fill-cangzhen-emotion-main/20" />}
                                            {hall.icon === 'zap' && <Zap size={10} className="text-cangzhen-inspiration-main fill-cangzhen-inspiration-main/20" />}
                                            {hall.icon === 'compass' && <Compass size={10} className="text-cangzhen-wisdom-main" />}
                                        </div>
                                        <div className="flex flex-col items-center leading-none">
                                            <span className="text-[6px] text-cangzhen-text-secondary/80 mb-0.5 scale-90 font-medium">{hall.name}</span>
                                            <span className="text-[10px] font-serif font-bold text-cangzhen-text-main drop-shadow-sm">{hall.count}</span>
                                        </div>
                                        {/* Highlight */}
                                        <div className="absolute inset-0 rounded-[0.8rem] bg-gradient-to-br from-white/60 to-transparent opacity-50 pointer-events-none" />
                                    </div>
                                ))}
                            </div>

                            {/* 3. Center Text */}
                            <div className="relative z-20 flex flex-col items-center justify-center h-full pointer-events-none mt-1">
                                <h3 className="text-xl font-serif font-bold text-cangzhen-text-main tracking-[0.2em] mb-2 drop-shadow-md bg-white/60 px-8 py-3 rounded-full backdrop-blur-md border border-white/50 shadow-sm">布展中...</h3>
                                <p className="text-[10px] text-cangzhen-text-secondary/80 uppercase tracking-[0.2em] font-medium opacity-70">Coming Soon</p>
                            </div>
                        </div>
                    ) : (
                        /* UNLOCKED STATE: Triangle Museum (Existing Code) */
                        <>
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
                                onClick={handleOpenBox}
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
                        </>
                    )}
                </div>

                {/* 3. Detailed Content (Only if Unlocked) */}
                {weeklyData.status === 'unlocked' && (
                    <>
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
                                          <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest">馆藏探索</h3>
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

                {/* LOCKED CONTENT: Fill empty space */}
                {weeklyData.status === 'locked' && (
                     <div className="px-6 py-6 space-y-6">
                         {/* 1. Footprints (Weekly Progress) */}
                         <div>
                            <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles size={14} /> 新增馆藏
                            </h3>
                            <div className="flex justify-between items-center px-2">
                                {weeklyData.progress.map((count, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${count > 0 ? 'bg-cangzhen-text-main shadow-lg scale-110' : 'bg-cangzhen-text-secondary/10'}`} />
                                        <span className={`text-[10px] font-sans ${count > 0 ? 'text-cangzhen-text-main font-bold' : 'text-cangzhen-text-secondary/40'}`}>
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                         </div>

                         {/* 2. Countdown */}
                         <div className="glass rounded-2xl p-6 flex items-center justify-between">
                             <div className="flex flex-col">
                                 <span className="text-xs text-cangzhen-text-secondary mb-1">距离展馆开启还有</span>
                                 <span className="text-2xl font-serif font-bold text-cangzhen-text-main">
                                     {weeklyData.daysLeft} <span className="text-sm font-normal opacity-60">天</span>
                                 </span>
                             </div>
                             <div className="w-12 h-12 rounded-full bg-cangzhen-text-main/5 flex items-center justify-center">
                                 <Gift size={20} className="text-cangzhen-text-main opacity-60" />
                             </div>
                         </div>
                         
                         {/* 3. Motivational Quote */}
                         <div className="text-center pt-8">
                             <p className="text-xs text-cangzhen-text-secondary/60 italic font-serif">
                                 "Keep collecting moments, <br/> not things."
                             </p>
                         </div>
                     </div>
                )}
             </>
          )}

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
             <div className="flex-1 h-full flex flex-col relative overflow-y-auto scrollbar-hide pb-24">
                 
                 {/* 1. Badge Wall Section */}
                 <div className={`w-full px-6 transition-all duration-500 relative ${isBadgeWallExpanded ? 'mb-8' : 'mb-4'} mt-4 shrink-0`}>
                     {/* Added Background Decoration for Badge Wall - Tender Green to Light Yellow Gradient */}
                     <div className="absolute inset-x-2 -top-4 -bottom-4 bg-gradient-to-br from-[#E8F5E9] via-[#FDF6E3] to-[#F0E8DD] rounded-[2rem] opacity-90 blur-2xl pointer-events-none" />
                     
                     <div className="flex items-center justify-between mb-4 relative z-10">
                         <h3 className="text-xs font-bold text-cangzhen-text-secondary uppercase tracking-widest flex items-center gap-2">
                             <Award size={14} /> 勋章墙 · Collection
                         </h3>
                         <button 
                            onClick={() => setIsBadgeWallExpanded(!isBadgeWallExpanded)}
                            className="text-[10px] text-cangzhen-text-secondary/60 hover:text-cangzhen-text-main transition-colors bg-white/20 px-2 py-1 rounded-full"
                         >
                             {isBadgeWallExpanded ? '收起' : '全部'}
                         </button>
                     </div>
                     
                     <div className={`grid grid-cols-4 gap-4 transition-all duration-500 overflow-hidden ${isBadgeWallExpanded ? 'max-h-[1000px]' : 'max-h-[160px]'} justify-items-center relative z-10`}>
                         {badges.map(badge => (
                             <div 
                                key={badge.id}
                                className="flex flex-col items-center gap-2 group relative"
                             >
                                 {/* Glass Sphere Container (Frosted & Convex) */}
                                 <div className={`
                                     relative w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105
                                     ${badge.unlocked 
                                         ? 'shadow-[inset_0_2px_6px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(255,255,255,0.5),0_8px_20px_rgba(0,0,0,0.05)] bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-sm border border-white/20' 
                                         : 'opacity-40 bg-white/5 border border-white/10 shadow-inner'}
                                 `}>
                                     {/* 1. Deep Glow (Core) - Smaller & Concentrated */}
                                    {badge.unlocked && (
                                        <div 
                                            className="absolute inset-0 opacity-60"
                                            style={{ background: `radial-gradient(circle at center, ${badge.mainColor}cc 0%, ${badge.mainColor}33 40%, transparent 70%)` }}
                                        />
                                    )}

                                    {/* 1.5 Ambient Glow (Fill the sphere slightly with flower color) */}
                                    {badge.unlocked && (
                                        <div 
                                            className="absolute inset-0 opacity-30 mix-blend-overlay"
                                            style={{ background: `radial-gradient(circle at 50% 120%, ${badge.mainColor}, transparent 70%)` }}
                                        />
                                    )}

                                    {/* 1.8 Warm Yellow Inner Glow (Subtle highlight) */}
                                    {badge.unlocked && (
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,253,208,0.4),transparent_60%)] mix-blend-screen" />
                                    )}
                                     
                                     {/* 2. Frosted Texture Noise Overlay (Optional - Simulated with grain if needed, but simple blur is cleaner) */}
                                     
                                     {/* 3. Strong Specular Highlight (Top Left) - Realistic Dot */}
                                     {badge.unlocked && (
                                         <div className="absolute top-[18%] left-[20%] w-[12%] h-[8%] bg-white rounded-full opacity-90 blur-[1px] transform -rotate-45 box-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                                     )}
                                     
                                     {/* 3.1 Secondary Soft Highlight (Top Left - Larger but faint) */}
                                     {badge.unlocked && (
                                         <div className="absolute top-[15%] left-[15%] w-[25%] h-[15%] bg-gradient-to-br from-white/40 to-transparent rounded-full opacity-60 blur-[3px] transform -rotate-45" />
                                     )}
                                     
                                     {/* 4. Secondary Reflection (Bottom Right) - Subtle */}
                                     {badge.unlocked && (
                                         <div className="absolute bottom-3 right-3 w-6 h-3 bg-gradient-to-tl from-white/40 to-transparent rounded-full opacity-50 blur-[2px] transform -rotate-45" />
                                     )}

                                     {/* 5. Rim Light - Enhances 3D effect */}
                                     <div className="absolute inset-0 rounded-full border border-white/20 shadow-[inset_0_0_8px_rgba(255,255,255,0.1)] pointer-events-none" />

                                     {/* Plant Icon */}
                                     <div className={`relative z-10 transform transition-transform duration-500 group-hover:scale-110 drop-shadow-sm ${!badge.unlocked && 'opacity-50 grayscale blur-[0.5px]'}`}>
                                         <FlowerIcon type={badge.plant} size={36} />
                                     </div>
                                 </div>

                                 {/* Label Info (Outside Sphere) */}
                                 <div className="text-center">
                                     {badge.unlocked ? (
                                         <>
                                            <h4 className="text-[10px] font-serif font-bold text-cangzhen-text-main tracking-widest mb-0.5">
                                                {badge.plantNameCN}
                                            </h4>
                                            <span className="text-[8px] text-cangzhen-text-secondary/60 block tracking-wide">
                                                {badge.meaning}
                                            </span>
                                         </>
                                     ) : (
                                         <>
                                            <h4 className="text-[10px] font-serif font-bold text-cangzhen-text-secondary tracking-widest mb-0.5 opacity-50">
                                                {badge.name.split('·')[1]}
                                            </h4>
                                            <span className="text-[8px] text-cangzhen-text-secondary/40 block tracking-wide uppercase">
                                                LOCKED
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

export default Review;
