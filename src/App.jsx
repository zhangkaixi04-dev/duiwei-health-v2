import React, { useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import CangzhenApp from './cangzhen/App';
import { User, Cloud, CloudOff, AlertTriangle, RefreshCcw } from 'lucide-react'; 
import { storageService } from './services/storageService';
import { authService } from './services/authService';

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

// App Switcher Component
import AppSwitcher from './components/AppSwitcher';

// Auth Status Component (Temporary)
const AuthStatus = () => {
    const [user, setUser] = React.useState(null);
    const [syncing, setSyncing] = React.useState(false);

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
            // If user not found, try to sign up
            if (error.message.includes('Invalid login credentials')) {
                 const confirmSignUp = confirm("账号不存在，是否创建新账号？");
                 if (confirmSignUp) {
                     const { error: signUpError } = await authService.signUp(email, password);
                     if (signUpError) {
                         alert("注册失败: " + signUpError.message);
                     } else {
                         alert("注册成功！请检查邮箱进行验证，或者直接登录（视Supabase设置而定）。");
                         // Auto sign in after sign up if email confirmation is off
                         await authService.signIn(email, password);
                     }
                 }
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
                <div className="flex items-center gap-2 bg-black/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-[10px] text-gray-600 font-medium">{user.email}</span>
                    <button onClick={handleLogout} className="text-[10px] text-red-500 hover:underline ml-2">退出</button>
                </div>
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
    <ErrorBoundary>
    <Router>
      <AppSwitcher />
      {/* 
         Temporary Auth UI for Demo 
         In a real app, this should be a proper Login Page or Modal
      */}
      <div className="fixed top-4 right-20 z-50">
          <AuthStatus />
      </div>

      <Routes>
        {/* Default route redirects to Hepai (AI Health Manager) for current testing */}
        <Route path="/" element={<Navigate to="/hepai" replace />} />
        
        {/* 藏真 APP 路由 */}
        <Route path="/cangzhen/*" element={<CangzhenApp />} />
        
        {/* 旧版合拍 APP 路由 */}
        <Route path="/hepai/*" element={<HepaiApp />} />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
