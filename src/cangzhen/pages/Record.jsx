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
              
              <div className="glass px-6 py-4 flex items-center gap-4">
                  <span className="text-xs text-cangzhen-text-secondary">5分钟内可撤回修改</span>
                  <button 
                    onClick={() => { setShowUndo(false); setIsSealing(false); setShowFlowerBloom(false); }}
                    className="text-sm font-medium text-cangzhen-text-main border-b border-cangzhen-text-main"
                  >
                      撤回
                  </button>
              </div>

              <button 
                onClick={() => navigate('/cangzhen')}
                className="mt-12 text-cangzhen-text-secondary hover:text-cangzhen-text-main"
              >
                  返回首页
              </button>
          </div>
      )
  }

  return (
    <div className="min-h-screen relative flex flex-col p-6 font-serif">
      {/* 1. 顶部导航 */}
      <header className="flex items-center justify-between mb-6 relative z-10">
        <button 
            onClick={() => navigate(-1)} 
            className="glass-convex p-3 rounded-full text-cangzhen-text-secondary hover:text-cangzhen-text-main"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium text-cangzhen-text-main absolute left-1/2 -translate-x-1/2">拾笔</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* 2. 书写区 */}
      <div className={`glass-concave flex-1 flex flex-col p-6 mb-6 transition-all duration-500 ${isSealing ? 'scale-95 opacity-50 blur-sm' : ''}`}>
        <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-italic text-cangzhen-text-secondary/60 italic tracking-wider">{dateStr}</span>
        </div>
        
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="此刻，你在感受什么？"
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-cangzhen-text-main placeholder:text-cangzhen-text-secondary/30 font-serif"
        />

        <div className="flex gap-4 mt-4 pt-4 border-t border-cangzhen-text-secondary/10">
            <button className="text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors">
                <ImageIcon size={20} strokeWidth={1.5} />
            </button>
            <button className="text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors">
                <Mic size={20} strokeWidth={1.5} />
            </button>
        </div>
      </div>

      {/* 3. 展馆选择 */}
      <div className={`mb-6 transition-all duration-300 ${isSealing ? 'opacity-0 translate-y-10' : ''}`}>
          <label className="text-xs text-cangzhen-text-secondary mb-3 block px-1">存入展馆</label>
          <div className="flex gap-3">
              {halls.map(hall => (
                  <button
                    key={hall.id}
                    onClick={() => setSelectedHall(hall.id)}
                    className={`
                        flex-1 py-3 rounded-2xl text-sm transition-all duration-300 relative overflow-hidden
                        ${selectedHall === hall.id ? 'glass-pressed text-cangzhen-text-main font-medium shadow-inner' : 'glass-convex text-cangzhen-text-secondary'}
                    `}
                  >
                      <span className="relative z-10">{hall.label}</span>
                      {selectedHall === hall.id && (
                          <div className={`absolute inset-0 opacity-20 ${hall.color}`} />
                      )}
                  </button>
              ))}
          </div>
      </div>

      {/* 4. 自定义标签 (Mock) */}
      <div className={`mb-8 transition-all duration-300 ${isSealing ? 'opacity-0 translate-y-10' : ''}`}>
          <div className="flex flex-wrap gap-2">
              <button className="glass-convex px-3 py-1 text-xs text-cangzhen-text-secondary flex items-center gap-1">
                  #添加标签 <span className="text-[10px]">+</span>
              </button>
              {tags.map(t => (
                  <span key={t} className="glass px-3 py-1 text-xs text-cangzhen-text-main">#{t}</span>
              ))}
          </div>
      </div>

      {/* 5. 封存按钮 */}
      <button
        onClick={handleSeal}
        disabled={!content.trim() || !selectedHall || isSealing}
        className={`
            w-full py-4 rounded-full text-sm font-medium tracking-widest transition-all duration-500
            ${!content.trim() || !selectedHall 
                ? 'glass-concave text-cangzhen-text-secondary/50 cursor-not-allowed' 
                : 'glass-convex text-cangzhen-text-main shadow-lg hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-white/40 to-white/10'}
            ${isSealing ? 'opacity-0' : ''}
        `}
      >
          封存此刻
      </button>

      {/* 6. 封存仪式动画层 */}
      {isSealing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
              {/* Stamp Animation */}
              <div className="animate-stamp w-48 h-48 rounded-full border-4 border-cangzhen-text-main/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-cangzhen-text-main/50 scale-90" />
                  <span className="text-cangzhen-text-main/30 font-serif text-xl tracking-[0.5em] rotate-[-15deg]">SEALED</span>
              </div>

              {/* Flower Bloom */}
              {showFlowerBloom && (
                  <div className="absolute inset-0 flex items-center justify-center animate-bloom bg-white/20 backdrop-blur-sm">
                      <FlowerIcon hallKey={selectedHall} size={120} className="drop-shadow-2xl" />
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Record;
