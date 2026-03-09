import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import CangzhenApp from './cangzhen/App';
import { User } from 'lucide-react'; 
import { storageService } from './services/storageService';

// App Switcher Component
import AppSwitcher from './components/AppSwitcher';

const HepaiApp = () => {
  useEffect(() => {
    // Migrate legacy data on startup
    storageService.migrateFromLegacy();
  }, []);

  return (
    <div className="flex flex-col h-screen supports-[height:100dvh]:h-[100dvh] bg-bg text-text-main font-sans overflow-hidden relative">
      {/* Main Content (Chat Interface) */}
      <main className="flex-1 overflow-hidden relative z-0">
        <ChatInterface />
      </main>
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
