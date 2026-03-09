import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';

const AppSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCangzhen = location.pathname.startsWith('/cangzhen');

  const toggleApp = () => {
    if (isCangzhen) {
      navigate('/hepai');
    } else {
      navigate('/cangzhen');
    }
  };

  return (
    <button
      onClick={toggleApp}
      className="fixed bottom-36 right-4 z-[9999] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 group"
    >
      <ArrowLeftRight size={12} className="text-gray-400 group-hover:text-gray-600" />
      <span>{isCangzhen ? '切换合拍' : '切换藏真'}</span>
    </button>
  );
};

export default AppSwitcher;
