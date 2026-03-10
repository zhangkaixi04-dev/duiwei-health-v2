// src/cangzhen/components/DailyRecommend.jsx
import React, { useEffect, useState } from 'react';
import { FlowerIcon } from './FlowerIcons';
import { healthService } from '../../services/healthService';
import { storageService } from '../../services/storageService';
import { Sparkles } from 'lucide-react';

const DailyRecommend = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const userProfile = storageService.getUserProfile();
        const result = await healthService.get_daily_recommendation(userProfile);
        setRecommendations(result);
      } catch (error) {
        console.error("Failed to load daily recommendations", error);
        // Fallback handled in service, but if network error bubbles up:
        setRecommendations({
            sensation: "去窗边看看云的形状，猜猜它像什么。",
            emotion: "深呼吸三次，告诉自己：今天已经做得很好了。",
            inspiration: "随手翻开一本书的第 20 页，读第一句话。"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  const displayRecommendations = recommendations ? [
      {
          id: 1,
          type: 'sensation',
          text: recommendations.sensation,
      },
      {
          id: 2,
          type: 'emotion',
          text: recommendations.emotion,
      },
      {
          id: 3,
          type: 'inspiration',
          text: recommendations.inspiration,
      },
      {
          id: 4,
          type: 'wanxiang',
          text: recommendations.wanxiang,
      }
  ] : [];

  if (loading) {
      return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-cangzhen-text-secondary mb-1 px-1 uppercase tracking-widest">今日推荐</h3>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-convex rounded-2xl p-4 flex items-center gap-4 opacity-60 animate-pulse">
                    <div className="w-10 h-10 rounded-squircle bg-white/20"></div>
                    <div className="flex-1 h-4 bg-white/20 rounded w-2/3"></div>
                </div>
            ))}
            <div className="text-center text-xs text-cangzhen-text-secondary flex items-center justify-center gap-1 mt-1">
                <Sparkles size={12} className="animate-spin" />
                <span>AI 正在为您捕捉今日灵感...</span>
            </div>
        </div>
      );
  }

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
