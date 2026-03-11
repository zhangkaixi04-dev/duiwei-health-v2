import React, { useState, useEffect } from 'react';
import { FlowerIcon } from './FlowerIcons';
import { Quote, X, Lock } from 'lucide-react';

const MuseumWalk = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [displayMemories, setDisplayMemories] = useState([]);
  const [isLocked, setIsLocked] = useState(true);
  const [randomDateStr, setRandomDateStr] = useState('');

  // Helper: Map Hall ID to Color
  const getHallColor = (hall) => {
    switch(hall) {
      case 'sensation': return 'bg-cangzhen-sensation-main';
      case 'emotion': return 'bg-cangzhen-emotion-main';
      case 'inspiration': return 'bg-cangzhen-inspiration-main';
      case 'wanxiang': return 'bg-cangzhen-custom-main';
      default: return 'bg-[#E0E0E0]';
    }
  };

  useEffect(() => {
      const stored = localStorage.getItem('cangzhen_memories');
      if (stored) {
          try {
              const parsed = JSON.parse(stored);
              const now = Date.now();
              const fiveDaysAgo = now - (5 * 24 * 60 * 60 * 1000);

              // 1. Filter memories older than 5 days
              const olderMemories = parsed.filter(item => {
                  const timestamp = typeof item.id === 'number' ? item.id : new Date(item.date).getTime(); // Fallback if id is not timestamp
                  return timestamp < fiveDaysAgo;
              });

              // 2. Check if total older records < 4
              if (olderMemories.length < 4) {
                  setIsLocked(true);
              } else {
                  setIsLocked(false);

                  // 3. Group by Date (YYYY-MM-DD)
                  const groupedByDate = {};
                  olderMemories.forEach(item => {
                      const timestamp = typeof item.id === 'number' ? item.id : new Date(item.date).getTime();
                      const dateObj = new Date(timestamp);
                      const dateKey = dateObj.toLocaleDateString(); // Local format as key
                      
                      if (!groupedByDate[dateKey]) {
                          groupedByDate[dateKey] = [];
                      }
                      
                      // Normalize item structure
                      groupedByDate[dateKey].push({
                          id: item.id,
                          date: dateKey, // Display date
                          tag: (item.tags && item.tags[0]) || '记录',
                          hall: item.hall || 'sensation',
                          content: item.content,
                          color: getHallColor(item.hall)
                      });
                  });

                  // 4. Pick a random date
                  const dates = Object.keys(groupedByDate);
                  if (dates.length > 0) {
                      const randomDate = dates[Math.floor(Math.random() * dates.length)];
                      setRandomDateStr(randomDate);
                      setDisplayMemories(groupedByDate[randomDate]);
                  }
              }

          } catch (e) {
              console.error("Failed to parse memories for Museum Walk", e);
              setIsLocked(true);
          }
      } else {
          setIsLocked(true);
      }
  }, []);

  if (isLocked) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium text-cangzhen-text-secondary uppercase tracking-widest">博物馆漫步</h3>
          </div>
          <div className="w-full h-32 glass-concave rounded-2xl flex flex-col items-center justify-center text-cangzhen-text-secondary/50 gap-2 border border-black/5">
              <Lock size={20} />
              <span className="text-xs tracking-widest font-serif">馆藏不足 · 敬请期待</span>
              <span className="text-[10px] opacity-60">记录满5天后开启时空漫游</span>
          </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-cangzhen-text-secondary uppercase tracking-widest">博物馆漫步 · {randomDateStr}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {displayMemories.map((item, index) => (
          <div 
            key={item.id}
            onClick={() => setActiveCard(item)}
            className="group relative h-28 cursor-pointer transition-all duration-500 hover:scale-[1.02]"
          >
            {/* Card Body - Standard Squircle Shape */}
            <div className="absolute inset-0 glass-convex rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 border border-white/40 shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:border-white/60">
               
               {/* Background Gradient Hint */}
               <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-[30px] opacity-20 ${item.color} transition-opacity duration-500 group-hover:opacity-40`} />

               {/* Icon */}
               <div className="mb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:-translate-y-1">
                  <FlowerIcon hallKey={item.hall} size={24} />
               </div>

               {/* Label Text */}
               <div className="text-center relative z-10">
                  <span className="block text-[10px] text-cangzhen-text-secondary tracking-wider mb-0.5 font-sans opacity-70">
                    {item.date}
                  </span>
                  <span className="block text-sm font-bold text-cangzhen-text-main font-serif tracking-wide group-hover:scale-110 transition-transform duration-500 line-clamp-1">
                    {item.tag}
                  </span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Modal / Overlay */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-cangzhen-bg/80 backdrop-blur-md transition-opacity" 
            onClick={() => setActiveCard(null)}
          />

          {/* Content Card */}
          <div className="relative w-full max-w-sm glass-convex rounded-[32px] p-8 shadow-2xl transform transition-all animate-stamp origin-center">
             
             {/* Close Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); setActiveCard(null); }}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-cangzhen-text-secondary transition-colors"
             >
                <X size={20} />
             </button>

             {/* Decorative Background */}
             <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-[50px] opacity-30 ${activeCard.color}`} />
             <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-30 ${activeCard.color}`} />

             {/* Content Body */}
             <div className="relative z-10 flex flex-col items-center text-center">
                
                {/* Header */}
                <div className="mb-6 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 glass-concave rounded-squircle flex items-center justify-center shadow-inner">
                        <FlowerIcon hallKey={activeCard.hall} size={28} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-cangzhen-text-secondary tracking-widest uppercase">{activeCard.date}</span>
                        <h2 className="text-2xl font-serif font-bold text-cangzhen-text-main mt-1">{activeCard.tag}</h2>
                    </div>
                </div>

                {/* Text */}
                <div className="relative">
                    <Quote size={24} className="absolute -top-4 -left-2 text-cangzhen-text-secondary/20 transform -scale-x-100" />
                    <p className="text-base text-cangzhen-text-main leading-relaxed font-serif px-2 min-h-[80px] flex items-center justify-center">
                        {activeCard.content}
                    </p>
                    <Quote size={24} className="absolute -bottom-4 -right-2 text-cangzhen-text-secondary/20" />
                </div>

                {/* Footer */}
                <div className="mt-8 w-full border-t border-black/5 pt-4">
                    <button 
                        onClick={() => setActiveCard(null)}
                        className="text-xs font-bold text-cangzhen-text-secondary hover:text-cangzhen-text-main tracking-widest transition-colors"
                    >
                        收起回忆
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseumWalk;
