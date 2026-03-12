import React, { useState, useEffect } from 'react';
import { FlowerIcon } from '../components/FlowerIcons';
import { Search, Calendar, SlidersHorizontal, X } from 'lucide-react';

const Museum = () => {
  const [activeTab, setActiveTab] = useState('sensation');
  const [localMemories, setLocalMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD format

  // Load memories from localStorage on mount
  useEffect(() => {
      const stored = localStorage.getItem('cangzhen_memories');
      if (stored) {
          try {
              const parsed = JSON.parse(stored);
              // Normalize data structure
              if (Array.isArray(parsed)) {
                  const normalized = parsed.map(item => {
                      const timestamp = typeof item.id === 'number' ? item.id : Date.now();
                      // Create a Date object for easier parsing
                      const dateObj = new Date(timestamp);
                      // Format for comparison (YYYY-MM-DD)
                      const isoDate = dateObj.toISOString().split('T')[0];
                      // Display format (e.g., "3月8日")
                      // If item.date is already a string like "3月8日", keep it for display but try to map to ISO
                      // For real data from Record.jsx, item.id is Date.now(), so we can rely on timestamp
                      
                      return {
                          ...item,
                          timestamp: timestamp,
                          isoDate: isoDate, // For filtering
                          displayDate: item.date.includes('月') ? item.date : dateObj.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
                          tag: item.tags && item.tags.length > 0 ? item.tags[0] : '记录',
                          image: item.image || null
                      };
                  });
                  // Sort by timestamp descending (newest first)
                  normalized.sort((a, b) => b.timestamp - a.timestamp);
                  setLocalMemories(normalized);
              } else {
                  setLocalMemories([]);
              }
          } catch (e) {
              console.error("Failed to parse memories", e);
              setLocalMemories([]);
          }
      }
  }, []);

  // Halls Configuration (Ordered: Sensation, Emotion, Creative, Decision)
  const halls = [
    { id: 'sensation', name: '感知馆', desc: '专注当下，亲身体验' },
    { id: 'emotion', name: '情绪馆', desc: '真诚连接，真挚表达' },
    { id: 'inspiration', name: '创意馆', desc: '一念灵动，万般可能' },
    { id: 'wanxiang', name: '决策馆', desc: '主动选择，勇敢决策' }
  ];

  // Helper to get ISO date from "X月X日" mock format (Assuming current year)
  const getMockIsoDate = (displayStr) => {
      const currentYear = new Date().getFullYear();
      const match = displayStr.match(/(\d+)月(\d+)日/);
      if (match) {
          const month = match[1].padStart(2, '0');
          const day = match[2].padStart(2, '0');
          return `${currentYear}-${month}-${day}`;
      }
      return '';
  };

  // Combine Real Data
  const allMemories = [...localMemories];

  // Filter Logic
  const currentMemories = allMemories.filter(m => {
      // 1. Hall Match
      const matchHall = m.hall === activeTab;
      
      // 2. Keyword Search (Fuzzy Match on Content or Tag)
      const matchKeyword = searchQuery 
        ? (m.content.includes(searchQuery) || m.tag.includes(searchQuery))
        : true;

      // 3. Date Filter (ISO Date Match)
      // selectedDate is "YYYY-MM-DD" from input[type=date]
      // m.isoDate is also "YYYY-MM-DD"
      const matchDate = selectedDate 
        ? m.isoDate === selectedDate
        : true;

      return matchHall && matchKeyword && matchDate;
  });

  // Split into columns for waterfall
  const col1 = [];
  const col2 = [];
  currentMemories.forEach((item, i) => {
      if (i % 2 === 0) col1.push(item);
      else col2.push(item);
  });

  // Memory Card Component
  const MemoryCard = ({ item }) => (
    <div className={`group relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl mb-3 glass-convex border border-white/40`}>
       
       {/* Background: Image or Gradient */}
       <div className="absolute inset-0">
           {item.image ? (
               <>
                   <img 
                     src={item.image} 
                     alt={item.tag}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               </>
           ) : (
               <div className={`w-full h-full bg-gradient-to-br ${
                   activeTab === 'sensation' ? 'from-[#EBE6D0] to-[#E0E6D0]' :
                   activeTab === 'emotion' ? 'from-[#E0E6D0] to-[#CDE0CD]' :
                   activeTab === 'inspiration' ? 'from-[#E2DCE8] to-[#D4D0E0]' :
                   'from-[#F0ECE4] to-[#E6E0D6]'
               } opacity-90`} />
           )}
       </div>

       {/* Content Overlay */}
       <div className={`absolute inset-0 p-4 flex flex-col z-10 ${item.image ? 'justify-between' : 'justify-center items-center text-center'}`}>
          {/* Top: Tag */}
          {item.image && (
            <div className="flex justify-end w-full">
                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white tracking-wider">
                    #{item.tag}
                </span>
            </div>
          )}

          {/* Center/Bottom: Text & Date */}
          <div className={`${!item.image ? 'w-full text-cangzhen-text-main' : 'text-white'}`}>
              {!item.image && (
                  <div className="mb-3 flex justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/30 text-[10px] font-bold text-cangzhen-text-secondary tracking-wider">
                        #{item.tag}
                      </span>
                  </div>
              )}
              
              <p className={`font-serif font-medium leading-relaxed mb-2 drop-shadow-sm ${item.image ? 'text-sm line-clamp-4 text-left' : 'text-sm line-clamp-5 text-center px-1 text-cangzhen-text-main'}`}>
                  {item.content}
              </p>
              
              <div className={`flex items-center gap-1 ${item.image ? 'justify-start opacity-70' : 'justify-center mt-3 text-cangzhen-text-secondary opacity-60'}`}>
                  <span className="text-[10px]">{item.displayDate}</span>
              </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F9F7F2] font-serif overflow-hidden">
      
      {/* 1. Top Tabs (Switch Halls) - Fixed Header */}
      <div className="pt-12 px-4 pb-2 bg-[#F9F7F2]/90 backdrop-blur-md z-20">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {halls.map(hall => (
            <button
              key={hall.id}
              onClick={() => { setActiveTab(hall.id); setSearchQuery(''); setSelectedDate(''); }}
              className={`
                px-5 py-2.5 rounded-full text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0
                ${activeTab === hall.id 
                    ? 'bg-cangzhen-text-main text-white shadow-lg scale-105 font-medium' 
                    : 'glass-convex text-cangzhen-text-secondary hover:bg-white/40'}
              `}
            >
              {hall.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hall Description & Search/Filter - Fixed Sub-Header */}
      <div className="px-6 pb-4 bg-[#F9F7F2]/90 backdrop-blur-md z-10 shadow-sm border-b border-white/50">
          <p className="text-xs text-cangzhen-text-secondary/80 italic tracking-wide leading-relaxed pl-1 mb-3">
              {halls.find(h => h.id === activeTab)?.desc}
          </p>
          
          {/* Search & Date Filter Area */}
          <div className="flex gap-2 items-center h-10">
              
              {/* Keyword Search Input */}
              <div className="flex-1 h-full relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cangzhen-text-secondary/50" size={14} />
                  <input 
                      type="text" 
                      placeholder="搜索关键词..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-full pl-9 pr-3 bg-white/40 border border-white/60 rounded-xl text-xs text-cangzhen-text-main placeholder:text-cangzhen-text-secondary/40 focus:outline-none focus:bg-white/60 focus:border-cangzhen-text-main/30 transition-all"
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-cangzhen-text-secondary/50 hover:text-cangzhen-text-main">
                          <X size={12} />
                      </button>
                  )}
              </div>

              {/* HTML5 Date Picker */}
              <div className="flex-1 h-full relative">
                  <div className="relative h-full">
                      {/* Standard Date Input - Allows full calendar selection */}
                      <input 
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full h-full pl-8 pr-2 bg-white/40 border border-white/60 rounded-xl text-xs text-cangzhen-text-secondary hover:bg-white/60 focus:outline-none transition-all cursor-pointer appearance-none"
                          style={{ colorScheme: 'light' }} 
                      />
                      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cangzhen-text-secondary/50 pointer-events-none" size={14} />
                      
                      {/* Clear Button */}
                      {selectedDate && (
                          <button 
                            onClick={(e) => { e.preventDefault(); setSelectedDate(''); }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-0.5 text-cangzhen-text-secondary/50 hover:text-cangzhen-text-main z-10"
                          >
                              <X size={10} />
                          </button>
                      )}
                  </div>
              </div>

          </div>
      </div>

      {/* 3. Waterfall Content (2 Columns) - Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 scrollbar-hide">
          <div className="flex gap-3 items-start">
             {/* Left Column */}
             <div className="flex-1 flex flex-col gap-3">
                {col1.map(item => <MemoryCard key={item.id} item={item} />)}
             </div>
             
             {/* Right Column (Staggered) */}
             <div className="flex-1 flex flex-col gap-3 pt-12">
                {col2.map(item => <MemoryCard key={item.id} item={item} />)}
             </div>
          </div>

          {/* Empty State */}
          {currentMemories.length === 0 && (
              <div className="flex flex-col items-center justify-center text-cangzhen-text-secondary/50 mt-20">
                  <FlowerIcon hallKey={activeTab} size={48} className="opacity-20 mb-2" />
                  <p className="text-xs">
                      {searchQuery || selectedDate ? '未找到相关内容' : '还没有记录，去添加第一笔吧'}
                  </p>
              </div>
          )}
      </div>
    </div>
  );
};

export default Museum;
