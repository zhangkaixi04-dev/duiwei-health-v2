import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CangzhenApp from './cangzhen/App';
import ChatInterface from './components/ChatInterface';
import { AlertTriangle, RefreshCcw } from 'lucide-react'; 
import { storageService } from './services/storageService';

/**
 * 🚨 CRITICAL ARCHITECTURE RULE 🚨
 * 
 * 1. This App contains TWO INDEPENDENT PROJECTS: "Hepai" (Health) and "Cangzhen" (Museum).
 * 2. They are logically separated and MUST NOT link to each other.
 * 3. DO NOT add any "App Switcher" or navigation buttons between them.
 * 4. DO NOT mix their service logic (healthService vs cangzhenService).
 * 
 * Please respect this isolation in all future updates.
 */

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    if (confirm('这将清除所有本地缓存数据（包括聊天记录），是否确认？')) {
        storageService.clearAll();
        window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">出错了</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-xs">
            抱歉，应用遇到了一些问题。可能是因为旧数据冲突导致的。
            <br/><br/>
            <span className="text-xs bg-gray-100 p-1 rounded font-mono text-gray-500">{this.state.error?.message}</span>
          </p>
          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all active:scale-95"
          >
            <RefreshCcw className="w-4 h-4" />
            重置应用数据
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

function App() {
  return (
    <ErrorBoundary>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/cangzhen" replace />} />
        <Route path="/hepai" element={<ChatInterface />} />
        <Route path="/cangzhen/*" element={<CangzhenApp />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
