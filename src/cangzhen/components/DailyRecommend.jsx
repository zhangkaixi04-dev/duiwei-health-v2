// src/cangzhen/components/DailyRecommend.jsx
import React, { useEffect, useState } from 'react';
import { FlowerIcon } from './FlowerIcons';
import { cangzhenService } from '../../services/cangzhenService';
import { Sparkles } from 'lucide-react';

const DailyRecommend = () => {
  // Hardcoded Fallback (Always available)
  const FALLBACK_DATA = {
      sensation: "去窗边看看云的形状，猜猜它像什么。",
      emotion: "深呼吸三次，告诉自己：今天已经做得很好了。",
      inspiration: "随手翻开一本书的第 20 页，读第一句话。",
      wanxiang: "做一个微小的决定，比如今天只喝温水。"
  };

  // Initialize with fallback to ensure content is ALWAYS visible
  const [recommendations, setRecommendations] = useState(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        let result = null;
        
        try {
            result = await cangzhenService.get_daily_recommendation();
        } catch (apiError) {
            console.warn("CangzhenService failed", apiError);
        }

        if (result && result.sensation) {
            setRecommendations(result);
        } 
        // If fail, we already have FALLBACK_DATA
      } catch (error) {
        console.error("DailyRecommend error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  const data = recommendations || FALLBACK_DATA;

  const displayRecommendations = [
      { id: 1, type: 'sensation', text: data.sensation || FALLBACK_DATA.sensation },
      { id: 2, type: 'emotion', text: data.emotion || FALLBACK_DATA.emotion },
      { id: 3, type: 'inspiration', text: data.inspiration || FALLBACK_DATA.inspiration },
      { id: 4, type: 'wanxiang', text: data.wanxiang || FALLBACK_DATA.wanxiang }
  ];

  // if (loading) { ... } // Removed loading state to always show content
  
  return (
    <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-cangzhen-text-secondary mb-1 px-1 uppercase tracking-widest">今日推荐</h3>
        {displayRecommendations.map((item, index) => (
            <div 
                key={item.id} 
                className="glass-convex rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 0.2}s` }}
            >
                {/* Background Tint */}
                <div className={`absolute inset-0 opacity-10 bg-cangzhen-${item.type}-main`} />
                
                {/* Icon */}
                <div 
                    className={`w-10 h-10 rounded-squircle glass-concave shadow-inner flex items-center justify-center shrink-0 border border-white/20`}
                    style={{
                        background: item.type === 'sensation' ? 'rgba(214, 206, 171, 0.15)' : 
                                   item.type === 'emotion' ? 'rgba(197, 204, 174, 0.15)' : 
                                   item.type === 'inspiration' ? 'rgba(196, 186, 208, 0.15)' : 
                                   item.type === 'wanxiang' ? 'rgba(137, 247, 254, 0.15)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <FlowerIcon hallKey={item.type} size={20} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-cangzhen-text-main font-medium truncate">{item.text}</p>
                </div>
            </div>
        ))}
    </div>
  );
};

export default DailyRecommend;
