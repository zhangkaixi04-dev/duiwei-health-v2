// src/cangzhen/components/Layout.jsx
import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Landmark, BarChart3, PenLine } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-cangzhen-text-main">
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
