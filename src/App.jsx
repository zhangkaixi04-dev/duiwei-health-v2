import React, { useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CangzhenApp from './cangzhen/App';
import ChatInterface from './components/ChatInterface';
import { User, Cloud, CloudOff, AlertTriangle, RefreshCcw, X } from 'lucide-react'; 
import { storageService } from './services/storageService';
import { authService } from './services/authService';

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

// Auth Status Component (Temporary)
const AuthStatus = () => {
    const [user, setUser] = React.useState(null);
    const [syncing, setSyncing] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);

    useEffect(() => {
        authService.getCurrentUser().then(setUser);
        const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN') {
                setSyncing(true);
                storageService.pullFromCloud().finally(() => setSyncing(false));
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async () => {
        // Demo Login
        const email = prompt("请输入邮箱进行注册/登录:");
        if (!email) return;
        
        const password = prompt("请输入密码:");
        if (!password) return;

        // Try to sign in first
        let { error } = await authService.signIn(email, password);
        
        if (error) {
            // Check for both "Invalid login credentials" AND "Email not confirmed"
            if (error.message.includes('Invalid login credentials')) {
                 const confirmSignUp = confirm("账号不存在，是否创建新账号？");
                 if (confirmSignUp) {
                     const { error: signUpError } = await authService.signUp(email, password);
                     if (signUpError) {
                         alert("注册失败: " + signUpError.message);
                     } else {
                         // Attempt auto-login immediately after signup
                         const { error: signInError } = await authService.signIn(email, password);
                         if (signInError) {
                             alert("注册成功，但自动登录失败: " + signInError.message);
                         } else {
                             // Success! No alert needed, UI will update
                         }
                     }
                 }
            } else if (error.message.includes('Email not confirmed')) {
                alert("请先验证您的邮箱（或者联系管理员关闭验证功能）。");
            } else {
                alert("登录失败: " + error.message);
            }
        }
    };

    const handleLogout = async () => {
        await authService.signOut();
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            {user ? (
                isExpanded ? (
                    <div className="flex items-center gap-2 bg-black/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm animate-fade-in">
                        <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[10px] text-gray-600 font-medium">{user.email}</span>
                        <button onClick={handleLogout} className="text-[10px] text-red-500 hover:underline ml-2">退出</button>
                        <button onClick={() => setIsExpanded(false)} className="ml-1 text-gray-400 hover:text-gray-600">
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-black/5 shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                    >
                         <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                    </button>
                )
            ) : (
                <button 
                    onClick={handleLogin}
                    className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm hover:bg-white transition-colors"
                >
                    <CloudOff size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-600 font-medium">未同步</span>
                </button>
            )}
        </div>
    );
};

function App() {
  return (
    <ErrorBoundary>
    <Router>
      {/* 
         Auth UI for Cloud Sync 
      */}
      <div className="fixed top-4 right-4 z-50">
          <AuthStatus />
      </div>

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
