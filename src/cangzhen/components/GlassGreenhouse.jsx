// src/cangzhen/components/GlassGreenhouse.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarOfBethlehem, LilyOfTheValley, IrisFlower, BabysBreath } from "./FlowerIcons";

const GlassGreenhouse = ({ stats }) => {
  const navigate = useNavigate();
  // Default stats
  const defaultStats = [
    { id: 'sensation', label: '感知', count: 12 },
    { id: 'emotion', label: '情绪', count: 5 },
    { id: 'inspiration', label: '灵感', count: 8 },
    { id: 'wanxiang', label: '万象', count: 0 }
  ];

  const data = stats || defaultStats;
  const total = data.reduce((acc, curr) => acc + curr.count, 0);
  const weekly = 3;

  const sensation = data.find(d => d.id === 'sensation') || defaultStats[0];
  const emotion = data.find(d => d.id === 'emotion') || defaultStats[1];
  const inspiration = data.find(d => d.id === 'inspiration') || defaultStats[2];
  const wanxiang = data.find(d => d.id === 'wanxiang') || defaultStats[3];

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

  return (
    <div className="relative flex flex-col items-center pt-0 pb-1">
      
      {/* 1. Warm Light Layer */}
      <div
        className="absolute pointer-events-none left-0 right-0 mx-auto"
        style={{
          width: '90%', height: 260, top: 40,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 60%, rgba(235,210,160,0.45) 0%, rgba(235,210,160,0.15) 50%, transparent 80%)",
          filter: "blur(40px)",
          zIndex: 0
        }}
      />

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
              <div className="absolute inset-0 z-20 flex justify-between px-6 py-6">
                  {/* Left Column */}
                  <div className="flex flex-col justify-between h-full">
                      <IconWrapper label="感知" count={sensation.count} icon={StarOfBethlehem} delay="0s" type="sensation" />
                      <IconWrapper label="情绪" count={emotion.count} icon={LilyOfTheValley} delay="1.2s" type="emotion" />
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col justify-between h-full">
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

              {/* Archway (Center) + Warm Light Glow */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] h-[120px] rounded-t-[60px] bg-gradient-to-b from-white/30 to-transparent border-t border-x border-white/50 z-10 backdrop-blur-[2px] overflow-hidden">
                  {/* Warm Light Glow inside Arch */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-[#FFD700] opacity-20 blur-[20px] rounded-full pointer-events-none" />
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
