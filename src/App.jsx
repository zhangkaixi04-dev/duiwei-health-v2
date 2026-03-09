import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import PersonalCenter from './components/PersonalCenter';
import CangzhenApp from './cangzhen/App';
import { User } from 'lucide-react'; 
import { storageService } from './services/storageService';

// App Switcher Component
import AppSwitcher from './components/AppSwitcher';

const HepaiApp = () => {
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Migrate legacy data on startup
    storageService.migrateFromLegacy();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-bg text-text-main font-sans overflow-hidden relative">
      {/* Header (Hepai Branding) */}
      <header className="px-5 py-3 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100/50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shadow-brand/20 shadow-md">
            合
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand tracking-wide leading-none">合拍</h1>
            <span className="text-[10px] text-text-muted font-medium tracking-wider uppercase block mt-0.5">Hepai AI Health</span>
          </div>
        </div>
        <button 
          onClick={() => setShowProfile(true)}
          className="p-2 rounded-full hover:bg-gray-50 transition-colors relative group"
        >
          <div className="absolute inset-0 bg-brand/5 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300"></div>
          <User className="w-5 h-5 text-text-muted group-hover:text-brand relative z-10" />
        </button>
      </header>

      {/* Main Content (Chat Interface) */}
      <main className="flex-1 overflow-hidden relative z-0">
        <ChatInterface />
      </main>

      {/* Profile Overlay */}
      {showProfile && (
        <div className="absolute inset-0 z-50 animate-in slide-in-from-right duration-300">
          <PersonalCenter onClose={() => setShowProfile(false)} />
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <>
      <AppSwitcher />
      <Routes>
        {/* 默认路由重定向到 /cangzhen (暂时) */}
        <Route path="/" element={<Navigate to="/cangzhen" replace />} />
        
        {/* 藏真 APP 路由 */}
        <Route path="/cangzhen/*" element={<CangzhenApp />} />
        
        {/* 旧版合拍 APP 路由 */}
        <Route path="/hepai/*" element={<HepaiApp />} />
      </Routes>
    </>
  );
}

export default App;
