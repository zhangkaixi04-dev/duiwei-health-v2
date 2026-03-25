// src/cangzhen/pages/Record.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Mic, X, Check, Share2, Award } from 'lucide-react';
import { FlowerIcon } from '../components/FlowerIcons';

import { storageService } from '../../services/storageService';

const Record = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [selectedHall, setSelectedHall] = useState(null);
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null); // New State for Image (Base64)
  const [isSealing, setIsSealing] = useState(false);
  const [showFlowerBloom, setShowFlowerBloom] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [earnedBadge, setEarnedBadge] = useState(null);

  const halls = [
    { id: 'sensation', label: '感知' },
    { id: 'emotion', label: '情绪' },
    { id: 'inspiration', label: '创意' },
    { id: 'wanxiang', label: '决策' }
  ];

  const BADGE_DEFINITIONS = [
    { id: 1, threshold: 1, plant: 'StarOfBethlehem', realPlantName: '伯利恒之星', displayName: '初见', meaning: '初见', desc: '清透如月光的温柔花材，带着初见的纯净与美好。' },
    { id: 2, threshold: 3, plant: 'Snowdrop', realPlantName: '雪滴花', displayName: '苏醒', meaning: '坚定', desc: '冰雪中绽放的坚韧小花，温柔却有力量。' },
    { id: 3, threshold: 7, plant: 'Lily', realPlantName: '百合', displayName: '破土', meaning: '微光', desc: '高原上的清雅花朵，自带清冷高级气质。' },
    { id: 4, threshold: 10, plant: 'Iris', realPlantName: '鸢尾花', displayName: '前行', meaning: '光亮', desc: '花形如蝶，优雅灵动。十次记录，是热爱的开始。' },
    { id: 5, threshold: 21, plant: 'Lotus', realPlantName: '莲花', displayName: '绽放', meaning: '笃定', desc: '上古灵草，羽叶清雅，自带沉稳力量。' },
    { id: 6, threshold: 30, plant: 'custom', realPlantName: '满天星', displayName: '繁花', meaning: '温柔', desc: '朦胧轻盈的治愈之花。一个月的陪伴，谢谢你认真记录。' }
  ];

  // Handle Image Upload
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImage(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveImage = () => {
      setImage(null);
  };

  const handleSeal = async () => {
    if (!content.trim() && !image) return; // Allow image-only or text-only
    if (!selectedHall) return;

    setIsSealing(true);

    // Save using storageService (Cloud Sync enabled)
    const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        content: content,
        hall: selectedHall,
        image: image, // Store Base64 image
        tags: [] 
    };

    const updatedEntries = await storageService.addCangzhenMemory(newEntry);
    
    const count = updatedEntries.length;

    // Delay badge reveal: Always show success screen first, then reveal badge if applicable
    const earnedBadge = BADGE_DEFINITIONS.find(b => b.threshold === count);
    if (earnedBadge) {
        // Delay setting the badge to allow the standard seal view to appear first
        setTimeout(() => {
            setEarnedBadge({ ...earnedBadge, count });
        }, 5000); // 5 seconds delay (user request)
    } else {
        // If count is 1, ensure badge is set even if logic fails slightly
        if (count === 1) {
             setTimeout(() => {
                const firstBadge = BADGE_DEFINITIONS.find(b => b.threshold === 1);
                setEarnedBadge({ ...firstBadge, count: 1 });
             }, 5000); // 5 seconds delay
        } else {
             setEarnedBadge(null);
        }
    }

    // Simulate API delay & Animation
    setTimeout(() => {
        setShowFlowerBloom(true);
    }, 500); // Faster bloom (was 800)

    setTimeout(() => {
        setShowSuccess(true);
    }, 1500); // Faster success screen (was 2500)
  };

  // --- Success / Badge Reveal Screen ---
  if (showSuccess) {
      return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F2F0E9] animate-fade-in relative overflow-hidden">
              {/* Background Decor */}
              <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cangzhen-sensation-main/20 rounded-full blur-[100px]" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cangzhen-emotion-main/20 rounded-full blur-[100px]" />
              </div>

              {/* Celebration Modal Overlay (If Badge Earned) */}
              {earnedBadge && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                      <div className="bg-[#F2F0E9] w-[90%] max-w-sm rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center animate-slide-up border border-white/50">
                          {/* Close Button */}
                          <button 
                              onClick={() => navigate('/cangzhen/review')} 
                              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-cangzhen-text-secondary"
                          >
                              <X size={20} />
                          </button>

                          {/* Header */}
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 text-xs font-medium tracking-widest mb-6 uppercase">
                              <Award size={12} /> Milestone Unlocked
                          </div>

                          {/* Badge Visual */}
                          <div className="relative w-40 h-40 mb-6 flex items-center justify-center animate-float-slow">
                              {/* Glow */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/40 to-white/40 rounded-full blur-2xl animate-pulse-slow pointer-events-none" />
                              
                              {/* Sphere */}
                              <div className="relative w-32 h-32 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15),inset_0_-8px_16px_rgba(255,255,255,0.4),inset_0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/40 z-10">
                                  <div className="absolute top-3 left-3 w-12 h-6 bg-gradient-to-br from-white to-transparent rounded-full opacity-70 blur-[2px] transform -rotate-45" />
                                  <div className="absolute bottom-3 right-3 w-10 h-5 bg-gradient-to-tl from-white/60 to-transparent rounded-full opacity-40 blur-[4px] transform -rotate-45" />
                                  <div className="absolute inset-2 rounded-full border border-white/20 shadow-inner" />
                                  <div className="relative z-10 transform scale-110 drop-shadow-lg filter saturate-110">
                                      <FlowerIcon type={earnedBadge.plant} size={64} />
                                  </div>
                              </div>
                          </div>

                          {/* Text Info */}
                          <h3 className="text-2xl font-serif font-bold text-cangzhen-text-main mb-2 tracking-widest">
                              {earnedBadge.realPlantName}
                          </h3>
                          <p className="text-xs text-cangzhen-text-secondary font-serif tracking-wider mb-6">
                              花语 · {earnedBadge.meaning}
                          </p>
                          <p className="text-sm text-cangzhen-text-secondary/80 font-serif leading-loose text-center mb-8 px-4">
                              "{earnedBadge.desc}"
                          </p>

                          {/* Action */}
                          <button 
                              onClick={() => navigate('/cangzhen/review')}
                              className="w-full py-3.5 rounded-full bg-cangzhen-text-main text-white text-sm font-medium tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                          >
                              <Award size={16} /> 收入徽章墙
                          </button>
                      </div>
                  </div>
              )}

              {/* Standard Success Screen (Always Visible Behind Modal) */}
              <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
                  
                  {/* 1. Header State */}
                  <div className="mb-8 text-center animate-slide-up">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 mx-auto text-green-600">
                          <Check size={32} />
                      </div>
                      <h2 className="text-2xl font-serif text-cangzhen-text-main mb-2 tracking-widest">封存成功</h2>
                      <p className="text-sm text-cangzhen-text-secondary">已安全存入 {halls.find(h=>h.id===selectedHall)?.label}馆</p>
                  </div>

                  {/* 2. Main Visual (Sealed Letter) */}
                  <div className="relative w-64 h-64 mb-10 flex items-center justify-center perspective-1000">
                       <div className="relative w-48 h-60 glass rounded-xl shadow-2xl border border-white/40 flex flex-col items-center p-6 transform rotate-[-2deg] animate-float transition-all duration-500 hover:rotate-0 hover:scale-105">
                           {/* Inner Border */}
                           <div className="absolute inset-2 border border-black/5 rounded-lg pointer-events-none" />
                           
                           {/* Content Preview (Abstract Lines) */}
                           <div className="w-full space-y-3 mt-4 opacity-30">
                               <div className="h-1 w-full bg-cangzhen-text-main rounded-full" />
                               <div className="h-1 w-3/4 bg-cangzhen-text-main rounded-full" />
                               <div className="h-1 w-5/6 bg-cangzhen-text-main rounded-full" />
                           </div>

                           {/* Center Flower Stamp */}
                           <div className="flex-1 flex items-center justify-center">
                               <div className="w-20 h-20 rounded-full border border-cangzhen-text-secondary/20 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                                 <FlowerIcon hallKey={selectedHall} size={48} className="opacity-80" />
                               </div>
                           </div>

                           {/* Seal Stamp */}
                           <div className="absolute bottom-6 right-4 w-16 h-16 border-[3px] border-cangzhen-text-main/20 rounded-full flex items-center justify-center rotate-[-15deg]">
                               <div className="flex flex-col items-center leading-none">
                                   <span className="text-[8px] font-bold text-cangzhen-text-main/40 tracking-widest uppercase">CANGZHEN</span>
                                   <span className="text-[12px] font-bold text-cangzhen-text-main/60 tracking-widest">SEALED</span>
                                   <span className="text-[6px] text-cangzhen-text-main/30 tracking-widest">{new Date().toLocaleDateString()}</span>
                               </div>
                           </div>
                           
                           {/* Paper Texture Overlay */}
                           <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none" />
                       </div>
                  </div>

                  {/* 4. Actions */}
                  <div className="flex flex-col gap-3 w-full animate-slide-up delay-300">
                      <button 
                        onClick={() => navigate('/cangzhen/museum')}
                        className="w-full py-3.5 rounded-full bg-cangzhen-text-main text-white text-sm font-medium tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-transform"
                      >
                          去博物馆看看
                      </button>
                      
                      <button 
                        onClick={() => { 
                            setShowSuccess(false); 
                            setIsSealing(false); 
                            setShowFlowerBloom(false); 
                            setContent(''); 
                            setSelectedHall(null); 
                            setEarnedBadge(null);
                        }}
                        className="w-full py-3.5 rounded-full bg-white/50 text-cangzhen-text-main text-sm font-medium tracking-[0.2em] hover:bg-white/80 transition-colors"
                      >
                          继续记录
                      </button>
                  </div>

              </div>
          </div>
      )
  }

  return (
    <div className="h-screen relative flex flex-col p-6 pb-24 font-serif overflow-hidden">
      {/* 1. 顶部导航 (Compact) */}
      <header className="flex items-center justify-between mb-2 shrink-0 relative z-10">
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
      <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0 h-full">
          
          {/* 2. 书写区 (Glass Card with Neumorphism) */}
          <div className={`rounded-xl flex-1 flex flex-col p-5 transition-all duration-500 relative group min-h-[200px] overflow-y-auto ${isSealing ? 'scale-95 opacity-50 blur-sm' : ''} shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.05),0_8px_20px_rgba(0,0,0,0.05)] bg-white/30 backdrop-blur-md border border-white/40`}>
            
            {/* Date & Time */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-medium text-cangzhen-text-secondary/60 tracking-wider uppercase font-sans">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + " · " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex gap-2">
                    <label className="text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors p-1 rounded-full hover:bg-black/5 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={!!image} />
                        <ImageIcon size={16} strokeWidth={1.5} className={image ? 'opacity-30' : ''} />
                    </label>
                </div>
            </div>
            
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="此刻你想收藏什么"
                className="w-full flex-1 bg-transparent border-none outline-none resize-none text-base leading-relaxed text-cangzhen-text-main placeholder:text-cangzhen-text-secondary/30 font-serif"
            />

            {/* Image Preview */}
            {image && (
                <div className="mt-4 relative group/image w-full max-w-[200px]">
                    <img src={image} alt="Preview" className="rounded-lg shadow-sm border border-white/50 w-full h-auto object-cover" />
                    <button 
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}
          </div>

          {/* 3. 存入展馆 (Compact Selection) */}
          <div className={`transition-all duration-300 shrink-0 ${isSealing ? 'opacity-0 translate-y-4' : ''}`}>
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
                          <span className={`w-1.5 h-1.5 rounded-full ${
                              hall.id === 'sensation' ? 'bg-[#D6CEAB]' : 
                              hall.id === 'emotion' ? 'bg-[#A0C4A0]' : 
                              hall.id === 'inspiration' ? 'bg-[#C4BAD0]' : 
                              'bg-[#E0D8C8]'
                          }`} />
                          {hall.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* 4. 封存按钮 (Bottom Action) */}
          <button
            onClick={handleSeal}
            disabled={(!content.trim() && !image) || !selectedHall || isSealing}
            className={`
                w-full py-3.5 rounded-2xl text-sm font-medium tracking-[0.2em] transition-all duration-500 shrink-0
                ${(!content.trim() && !image) || !selectedHall 
                    ? 'glass-convex text-cangzhen-text-secondary/40 cursor-not-allowed bg-white/20' 
                    : 'bg-cangzhen-text-main text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95'}
                ${isSealing ? 'opacity-0 translate-y-10' : ''}
            `}
          >
              {(!content.trim() && !image) || !selectedHall ? '请先选择要存放的展馆' : '封存藏品'}
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
