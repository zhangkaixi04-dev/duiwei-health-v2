// src/cangzhen/components/Layout.jsx
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Landmark, BarChart3, PenLine, Wand2 } from 'lucide-react';
import AuthStatus from '../../components/AuthStatus';
import { storageService } from '../../services/storageService';
import { supabaseCangzhen } from '../../services/authService';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMockData = async () => {
    try {
        const halls = ['sensation', 'emotion', 'inspiration', 'wanxiang'];
        const contents = [
            '路边开了一朵淡紫色的小花，像是在对我微笑。',
            '今天读到一句话：生活不是为了赶路，而是为了感受路。',
            '突然想到可以把收集的贝壳做成风铃，挂在窗前。',
            '决定开始每天冥想10分钟，给自己一段空白的时间。',
            '咖啡店的香气今天格外治愈，让人心情平静。',
            '观察云朵的变化，发现有一朵长得像奔跑的小兔子。',
            '尝试画了一幅速写，虽然稚嫩但充满了快乐。',
            '坚定地对不合理的要求说“不”，感觉轻松了很多。'
        ];
        
        const mockMemories = [];
        const now = new Date();
        
        let userId = 'guest_user';
        try {
            const { data: { session } } = await supabaseCangzhen.auth.getSession();
            userId = session?.user?.id || 'guest_user';
        } catch (e) {
            console.warn("Supabase session fetch failed, using guest", e);
        }
        
        // Mock data for the past 45 days
        for (let i = 0; i < 45; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            
            if (Math.random() > 0.4) {
                const count = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < count; j++) {
                    mockMemories.push({
                        id: date.getTime() - (j * 1000),
                        date: date.toISOString(),
                        hall: halls[Math.floor(Math.random() * halls.length)],
                        content: contents[Math.floor(Math.random() * contents.length)],
                        userId: userId
                    });
                }
            }
        }
        
        await storageService.saveCangzhenMemories(mockMemories);
        
        // Clear cached summaries
        Object.keys(localStorage).forEach(key => {
            if (key.includes('weekly_summary_')) {
                localStorage.removeItem(key);
            }
        });
        
        alert("✨ 模拟数据已注入！正在为您重新开启博物馆...");
        window.location.reload(); 
    } catch (error) {
        console.error("Mock Data Error:", error);
        alert("注入失败: " + error.message);
    }
  };

  const navItems = [
    { path: "/cangzhen", icon: Home, label: "首页" },
    { path: "/cangzhen/museum", icon: Landmark, label: "博物馆" },
    { path: "/cangzhen/record", icon: PenLine, label: "拾笔", isCenter: true },
    { path: "/cangzhen/review", icon: BarChart3, label: "回顾" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-6">
        <div className="relative glass-strong rounded-[28px] px-2 py-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/cangzhen' && location.pathname.startsWith(item.path));
            
            if (item.isCenter) {
              return (
                <div key={item.path} className="relative -mt-12 group">
                   <button
                    onClick={() => navigate(item.path)}
                    className="flex h-14 w-14 items-center justify-center rounded-full glass-convex transition-transform active:scale-90 shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #EBD2A0 0%, #C5CCAE 100%)",
                      border: "1px solid rgba(255,255,255,0.8)"
                    }}
                  >
                    <item.icon className="h-6 w-6 text-white relative z-10" strokeWidth={2} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1 transition-all duration-300
                  ${isActive ? "text-cangzhen-text-main" : "text-cangzhen-text-secondary/60"}
                `}
              >
                <item.icon
                  className={`h-6 w-6 transition-all duration-300 ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className="text-[10px] tracking-widest font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

const Layout = () => {
  console.log("Cangzhen Layout rendering...");
  const navigate = useNavigate();
  const location = useLocation();

  const handleMockDataFromLayout = async () => {
    console.log("Mock button from layout clicked!");
    try {
        const halls = ['sensation', 'emotion', 'inspiration', 'wanxiang'];
        const contents = [
            '路边开了一朵淡紫色的小花，像是在对我微笑。',
            '今天读到一句话：生活不是为了赶路，而是为了感受路。',
            '突然想到可以把收集的贝壳做成风铃，挂在窗前。',
            '决定开始每天冥想10分钟，给自己一段空白的时间。',
            '咖啡店的香气今天格外治愈，让人心情平静。',
            '观察云朵的变化，发现有一朵长得像奔跑的小兔子。',
            '尝试画了一幅速写，虽然稚嫩但充满了快乐。',
            '坚定地对不合理的要求说“不”，感觉轻松了很多。'
        ];
        const mockTags = ['感知', '生活', '日常', '情绪', '灵感', '思考', '发现', '美好'];
        
        const mockMemories = [];
        const now = new Date();
        
        let userId = 'guest_user';
        try {
            const sessionData = await supabaseCangzhen.auth.getSession();
            userId = sessionData?.data?.session?.user?.id || 'guest_user';
        } catch (e) {
            console.warn("Supabase session fetch failed, using guest", e);
        }
        
        for (let i = 0; i < 45; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            if (Math.random() > 0.4) {
                const count = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < count; j++) {
                    mockMemories.push({
                        id: date.getTime() - (j * 1000),
                        date: date.toISOString(),
                        hall: halls[Math.floor(Math.random() * halls.length)],
                        content: contents[Math.floor(Math.random() * contents.length)],
                        tags: [mockTags[Math.floor(Math.random() * mockTags.length)]],
                        userId: userId
                    });
                }
            }
        }
        
        await storageService.saveCangzhenMemories(mockMemories);
        
        // Clear ALL cached summaries AND opened status to force AI regeneration
        Object.keys(localStorage).forEach(key => {
            if (key.includes('weekly_summary_') || 
                key.includes('monthly_summary_') || 
                key.includes('weekly_opened_') || 
                key.includes('monthly_opened_')) {
                localStorage.removeItem(key);
            }
        });
        
        alert("✨ 模拟数据已注入！已清空所有缓存，即将重新生成 AI 报告...");
        window.location.reload(); 
    } catch (error) {
        alert("注入失败: " + error.message);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-cangzhen-text-main">
      {/* Auth Status for Cangzhen (Isolated) */}
      <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3">
          <button 
              onClick={handleMockDataFromLayout}
              className="px-4 py-2.5 rounded-2xl bg-brand text-white shadow-[0_8px_32px_rgba(74,124,89,0.3)] hover:bg-brand/90 transition-all flex items-center gap-2 border-2 border-white/50 active:scale-95 group"
              title="Generate Mock Data"
          >
              <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-bold tracking-wide">模拟数据</span>
          </button>
          <div className="bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-white/50 shadow-sm">
              <AuthStatus appName="cangzhen" isStatic={true} />
          </div>
      </div>

      {/* 1. Ambient Background */}
      <div className="fixed inset-0 ambient-background z-0" />
      
      {/* 2. Noise Overlay */}
      <div className="noise-overlay z-10" />

      {/* 3. Page Content */}
      <div className="relative z-20 min-h-screen pb-24">
        <Outlet />
      </div>

      {/* 4. Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
