// src/cangzhen/components/GlassGreenhouse.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarOfBethlehem, LilyOfTheValley, IrisFlower, BabysBreath } from "./FlowerIcons";

const GlassGreenhouse = ({ stats, onOpen, isOpen }) => {
  const navigate = useNavigate();
  // Helper: Get counts (using props or default)
  // NOTE: In a real app, this should come from props `stats`. 
  // The user asked to "Connect Real Data", so we should prioritize props.
  const sensation = stats.find(d => d.id === 'sensation') || { count: 0 };
  const emotion = stats.find(d => d.id === 'emotion') || { count: 0 };
  const inspiration = stats.find(d => d.id === 'inspiration') || { count: 0 };
  const wanxiang = stats.find(d => d.id === 'wanxiang') || { count: 0 };

  const IconWrapper = ({ label, count, icon: Icon, delay, type }) => (
    <div 
        className="flex flex-col items-center gap-1 group cursor-pointer animate-float"
        style={{ animationDelay: delay }}
        onClick={() => navigate('/cangzhen/museum')}
    >
        <div 
            className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-active:scale-95 glass-concave rounded-squircle shadow-inner border border-white/20"
            style={{
                background: type === 'sensation' ? 'rgba(214, 206, 171, 0.15)' : 
                           type === 'emotion' ? 'rgba(197, 204, 174, 0.15)' : 
                           type === 'inspiration' ? 'rgba(196, 186, 208, 0.15)' : 
                           'rgba(224, 216, 200, 0.15)'
            }}
        >
            <Icon size={20} className="opacity-90" />
        </div>
        <div className="flex flex-col items-center">
            <span className="text-[9px] text-cangzhen-text-secondary font-serif leading-none mb-0.5">{label}</span>
            <span className="text-xs text-cangzhen-text-main font-serif font-medium leading-none">{count}</span>
        </div>
    </div>
  );

  const [isOpening, setIsOpening] = React.useState(false);

  // If isOpen prop is true (from localStorage), we treat it as open.
  // Or if local animation is playing.
  const effectiveOpen = isOpen || isOpening;

  const handleArchClick = (e) => {
      e.stopPropagation();
      if (effectiveOpen) return; // Don't re-open if already open
      setIsOpening(true);
      if (onOpen) onOpen();
      
      // Do NOT reset animation automatically if we expect it to stay open via prop eventually
      // But if the user cancels the modal, we might need to reset.
      // For now, let's keep it open once clicked until page reload or prop change.
  };

  return (
    <div className="relative flex flex-col items-center pt-0 pb-1">
      
      {/* 1. Warm Light Layer - Removed as requested */}
      {/* <div className={`absolute ...`} /> */}

      {/* 2. Building Structure + Content */}
      <div className="relative z-10 flex flex-col items-center transform scale-[0.85] origin-bottom">
          
          {/* Roof */}
          <div className="relative">
              <div 
                  className="w-0 h-0 border-l-[165px] border-l-transparent border-r-[165px] border-r-transparent border-b-[90px] border-b-white/40 backdrop-blur-sm"
              />
              <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[330px] h-[90px]" viewBox="0 0 330 90" fill="none">
                  <path d="M165 0L330 90M165 0L0 90" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
                  <circle cx="165" cy="0" r="3" fill="white" />
              </svg>
          </div>

          {/* Body Container */}
          <div className="relative w-[310px] h-[200px] mt-[-1px] glass border-t-0 rounded-b-lg shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
              
              {/* Icons Grid Layout (Inside Glass) */}
              <div className="absolute inset-0 z-20 flex justify-between px-6 py-6 pointer-events-none">
                  {/* Left Column */}
                  <div className="flex flex-col justify-between h-full pointer-events-auto">
                      <IconWrapper label="感知" count={sensation.count} icon={StarOfBethlehem} delay="0s" type="sensation" />
                      <IconWrapper label="情绪" count={emotion.count} icon={LilyOfTheValley} delay="1.2s" type="emotion" />
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col justify-between h-full pointer-events-auto">
                      <IconWrapper label="灵感" count={inspiration.count} icon={IrisFlower} delay="0.6s" type="inspiration" />
                      <IconWrapper label="万象" count={wanxiang.count} icon={BabysBreath} delay="1.8s" type="wanxiang" />
                  </div>
              </div>

              {/* Grid Lines (Background) */}
              <div className="absolute inset-0 flex justify-between pointer-events-none z-10 opacity-70">
                  <div className="w-[1px] h-full bg-white/40" />
                  <div className="w-[1px] h-full bg-white/20" />
                  <div className="w-[1px] h-full bg-white/20" />
                  <div className="w-[1px] h-full bg-white/40" />
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/30 z-10 opacity-60" />

              {/* Archway (Center) - INTERACTIVE DOOR */}
              <div 
                  onClick={handleArchClick}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] h-[120px] rounded-t-[60px] z-30 cursor-pointer group/door"
              >
                  {/* Container for Doors (Overflow Hidden to clip doors) */}
                  <div className="absolute inset-0 rounded-t-[60px] overflow-hidden z-20">
                      {/* Left Door Panel - Glass */}
                      <div className={`absolute top-0 left-0 w-[51%] h-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm border-r border-white/30 origin-left transition-all duration-[1.5s] ease-in-out ${effectiveOpen ? '-rotate-y-[100deg] opacity-0' : 'rotate-y-0 group-hover/door:bg-white/20'}`}>
                          <div className="absolute top-1/2 right-3 w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                          {/* Glass Reflection */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Right Door Panel - Glass */}
                      <div className={`absolute top-0 right-0 w-[51%] h-full bg-gradient-to-bl from-white/30 to-white/10 backdrop-blur-sm border-l border-white/30 origin-right transition-all duration-[1.5s] ease-in-out ${effectiveOpen ? 'rotate-y-[100deg] opacity-0' : 'rotate-y-0 group-hover/door:bg-white/20'}`}>
                          <div className="absolute top-1/2 left-3 w-1.5 h-1.5 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                          {/* Glass Reflection */}
                          <div className="absolute inset-0 bg-gradient-to-tl from-white/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                  </div>

                  {/* Door Frame (On Top) */}
                  <div className="absolute inset-0 rounded-t-[60px] border-[2px] border-white/40 pointer-events-none z-30 shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]" />

                  {/* Inner Light Source (Behind Doors) - Transparent initially */}
                  <div className="absolute inset-0 z-10 flex items-end justify-center rounded-t-[60px] overflow-hidden">
                      {/* 1. Core Light (Brightest - Pale/Goose Yellow - Softer/Elegant) */}
                      <div className={`absolute bottom-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(255,252,225,0.9)_0%,rgba(255,248,200,0.5)_40%,rgba(255,250,240,0)_80%)] mix-blend-screen transition-all duration-1000 ${effectiveOpen ? 'opacity-100' : 'opacity-0'}`} />
                      
                      {/* 2. Rippling/Diffused Light (Weak at edges - More spread out) */}
                      <div className={`absolute bottom-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,250,205,0.3)_0%,rgba(255,250,220,0.1)_60%,transparent_80%)] blur-md transition-all duration-1000 ${effectiveOpen ? 'opacity-100 scale-110' : 'opacity-0 scale-90'}`} />
                      
                      {/* 3. Ambient Glow (Soft background when closed) */}
                      <div className={`absolute inset-0 bg-white/5 transition-all duration-1000 ${effectiveOpen ? 'opacity-0' : 'opacity-100'}`} />
                  </div>
                  
                  {/* Seam Light (Subtle leak) */}
                  {!effectiveOpen && (
                      <div className="absolute inset-0 z-25 flex justify-center pointer-events-none">
                          <div className="w-[1px] h-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.5)] opacity-50" />
                      </div>
                  )}

                  {/* Click Hint */}
                  {!effectiveOpen && (
                      <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover/door:opacity-100 transition-opacity duration-300 z-40">
                          <span className="text-[8px] text-white/90 tracking-[0.3em] uppercase font-bold drop-shadow-md">OPEN</span>
                      </div>
                  )}
              </div>
          </div>

          {/* Base */}
          <div className="w-[330px] h-[28px] bg-gradient-to-b from-[#C5CCAE] to-[#B8C4A0] rounded-b-[12px] shadow-xl relative z-20">
               {/* Flower Decorations */}
               <div className="absolute -top-6 left-[-10px] opacity-90"><LilyOfTheValley size={28} /></div>
               <div className="absolute -top-5 right-[-8px] opacity-90"><IrisFlower size={26} /></div>
          </div>
      </div>
    </div>
  );
};

export default GlassGreenhouse;
