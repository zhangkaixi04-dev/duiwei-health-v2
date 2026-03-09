import React from 'react';
import { MessageCircle, Activity, User, Sparkles } from 'lucide-react';

const Layout = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen bg-bg text-text-main font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-bg/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">
            对
          </div>
          <h1 className="text-lg font-semibold text-brand tracking-wide">对味 Duiwei</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <User className="w-5 h-5 text-text-muted" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-3 flex justify-around items-center z-20 shadow-lg shadow-gray-100/50 rounded-t-3xl">
        <button 
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'chat' ? 'text-brand scale-105' : 'text-text-muted hover:text-brand/70'}`}
        >
          <div className={`p-2 rounded-2xl ${activeTab === 'chat' ? 'bg-brand/10' : 'bg-transparent'}`}>
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">健康顾问</span>
        </button>
        
        <button 
          onClick={() => onTabChange('feed')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'feed' ? 'text-brand scale-105' : 'text-text-muted hover:text-brand/70'}`}
        >
          <div className={`p-2 rounded-2xl ${activeTab === 'feed' ? 'bg-brand/10' : 'bg-transparent'}`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">每日推荐</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
