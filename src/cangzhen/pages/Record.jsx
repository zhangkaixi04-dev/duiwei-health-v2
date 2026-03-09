// src/cangzhen/pages/Record.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Mic, X } from 'lucide-react';
import { FlowerIcon } from '../components/FlowerIcons';

const Record = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedHall, setSelectedHall] = useState(null);
  const [tags, setTags] = useState([]);
  const [isSealing, setIsSealing] = useState(false);
  const [showFlowerBloom, setShowFlowerBloom] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  // Mock Date
  const dateStr = "MARCH 8, 2026 · 14:30";

  const halls = [
    { id: 'sensation', label: '感知', color: 'bg-cangzhen-sensation-main' },
    { id: 'emotion', label: '情绪', color: 'bg-cangzhen-emotion-main' },
    { id: 'inspiration', label: '灵感', color: 'bg-cangzhen-inspiration-main' },
    { id: 'wanxiang', label: '万象', color: 'bg-cangzhen-wanxiang-main' },
  ];

  const handleSeal = () => {
    if (!content.trim() || !selectedHall) return;

    setIsSealing(true);

    // Sequence:
    // 1. Stamp Animation (0.6s) -> handled by CSS class 'animate-stamp'
    // 2. Flower Bloom (0.8s) -> show after stamp
    // 3. Undo Toast (5 mins) -> show after bloom

    setTimeout(() => {
        setShowFlowerBloom(true);
    }, 600);

    setTimeout(() => {
        setShowUndo(true);
        // In real app, navigate away or clear form after some time
        // navigate('/cangzhen/museum');
    }, 1500);
  };

  if (showUndo) {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cangzhen-bg/90 backdrop-blur-md animate-fade-in">
              <div className="scale-150 mb-8 animate-float">
                  <FlowerIcon hallKey={selectedHall} size={80} />
              </div>
              <h2 className="text-2xl font-serif text-cangzhen-text-main mb-2">已封存</h2>
              <p className="text-sm text-cangzhen-text-secondary mb-8">正在送往 {halls.find(h=>h.id===selectedHall)?.label}馆...</p>
              
              <div className="glass px-6 py-4 flex items-center gap-4 mb-8">
                  <span className="text-xs text-cangzhen-text-secondary">5分钟内可撤回修改</span>
                  <button 
                    onClick={() => { setShowUndo(false); setIsSealing(false); setShowFlowerBloom(false); }}
                    className="text-sm font-medium text-cangzhen-text-main border-b border-cangzhen-text-main"
                  >
                      撤回
                  </button>
              </div>

              <div className="flex flex-col gap-4 w-full px-12">
                  <button 
                    onClick={() => navigate('/cangzhen/museum')}
                    className="w-full py-3 rounded-full bg-cangzhen-text-main text-white text-sm tracking-widest shadow-lg hover:scale-105 transition-transform"
                  >
                      去博物馆看看
                  </button>
                  <button 
                    onClick={() => { setShowUndo(false); setIsSealing(false); setShowFlowerBloom(false); setContent(''); setSelectedHall(null); }}
                    className="w-full py-3 rounded-full glass-convex text-cangzhen-text-main text-sm tracking-widest hover:bg-white/40 transition-colors"
                  >
                      再记一笔
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen relative flex flex-col p-6 font-serif overflow-hidden">
      {/* 1. 顶部导航 (Compact) */}
      <header className="flex items-center justify-between mb-4 relative z-10">
        <button 
            onClick={() => navigate(-1)} 
            className="glass-convex p-2 rounded-full text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors"
        >
            <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-cangzhen-text-secondary tracking-widest uppercase opacity-70">New Entry</span>
        <div className="w-9" /> 
      </header>

      {/* Main Container: Single Screen Layout */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          
          {/* 2. 书写区 (Glass Card) */}
          <div className={`glass-convex rounded-2xl flex-1 flex flex-col p-5 transition-all duration-500 relative group border border-white/40 shadow-sm ${isSealing ? 'scale-95 opacity-50 blur-sm' : ''}`}>
            
            {/* Date & Time */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-medium text-cangzhen-text-secondary/60 tracking-wider uppercase font-sans">{dateStr}</span>
                <div className="flex gap-2">
                    <button className="text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors p-1 rounded-full hover:bg-black/5">
                        <ImageIcon size={16} strokeWidth={1.5} />
                    </button>
                    <button className="text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors p-1 rounded-full hover:bg-black/5">
                        <Mic size={16} strokeWidth={1.5} />
                    </button>
                </div>
            </div>
            
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="此刻，你在感受什么？"
                className="w-full flex-1 bg-transparent border-none outline-none resize-none text-base leading-relaxed text-cangzhen-text-main placeholder:text-cangzhen-text-secondary/30 font-serif"
            />
          </div>

          {/* 3. 存入展馆 (Compact Selection) */}
          <div className={`transition-all duration-300 ${isSealing ? 'opacity-0 translate-y-4' : ''}`}>
              <div className="glass-concave rounded-2xl p-1.5 flex gap-1">
                  {halls.map(hall => (
                      <button
                        key={hall.id}
                        onClick={() => setSelectedHall(hall.id)}
                        className={`
                            flex-1 py-3 rounded-xl text-xs transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center gap-1
                            ${selectedHall === hall.id 
                                ? 'bg-white shadow-sm text-cangzhen-text-main font-bold scale-[1.02]' 
                                : 'text-cangzhen-text-secondary hover:bg-white/40'}
                        `}
                      >
                          <span className={`w-1.5 h-1.5 rounded-full ${hall.color}`} />
                          {hall.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* 4. 封存按钮 (Bottom Action) */}
          <button
            onClick={handleSeal}
            disabled={!content.trim() || !selectedHall || isSealing}
            className={`
                w-full py-3.5 rounded-2xl text-sm font-medium tracking-[0.2em] transition-all duration-500
                ${!content.trim() || !selectedHall 
                    ? 'glass-convex text-cangzhen-text-secondary/40 cursor-not-allowed bg-white/20' 
                    : 'bg-cangzhen-text-main text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95'}
                ${isSealing ? 'opacity-0 translate-y-10' : ''}
            `}
          >
              封存此刻
          </button>
      </div>

      {/* 6. 封存仪式动画层 */}
      {isSealing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
              {/* Stamp Animation */}
              <div className="animate-stamp w-40 h-40 rounded-full border-[3px] border-cangzhen-text-main/20 flex items-center justify-center relative backdrop-blur-sm bg-white/10">
                  <div className="absolute inset-0 rounded-full border border-cangzhen-text-main/40 scale-90" />
                  <span className="text-cangzhen-text-main/40 font-serif text-lg tracking-[0.4em] rotate-[-15deg]">SEALED</span>
              </div>

              {/* Flower Bloom */}
              {showFlowerBloom && (
                  <div className="absolute inset-0 flex items-center justify-center animate-bloom bg-white/30 backdrop-blur-md">
                      <FlowerIcon hallKey={selectedHall} size={100} className="drop-shadow-2xl filter saturate-150" />
                  </div>
              )}
          </div>
      )}
    </div>
  );

};

export default Record;
