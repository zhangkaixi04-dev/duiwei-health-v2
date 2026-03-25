import React, { useEffect } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { CloudOff, X } from 'lucide-react';

const AuthStatus = ({ appName = 'hepai', isStatic = false }) => {
    const [user, setUser] = React.useState(null);
    const [syncing, setSyncing] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);

    useEffect(() => {
        authService.getCurrentUser(appName).then(setUser);
        const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN') {
                setSyncing(true);
                // Pull data based on app context
                // Note: pullFromCloud currently pulls ALL data. 
                // We might want to optimize this later, but for now it's fine as it checks both sessions.
                storageService.pullFromCloud().finally(() => setSyncing(false));
            }
        }, appName);
        return () => subscription.unsubscribe();
    }, [appName]);

    const handleLogin = async () => {
        // Demo Login
        const email = prompt("请输入邮箱进行注册/登录:");
        if (!email) return;
        
        const password = prompt("请输入密码:");
        if (!password) return;

        // Try to sign in first
        let { error } = await authService.signIn(email, password, appName);
        
        if (error) {
            // Check for both "Invalid login credentials" AND "Email not confirmed"
            if (error.message.includes('Invalid login credentials')) {
                 const confirmSignUp = confirm("账号不存在，是否创建新账号？");
                 if (confirmSignUp) {
                     const { error: signUpError } = await authService.signUp(email, password, appName);
                     if (signUpError) {
                         alert("注册失败: " + signUpError.message);
                     } else {
                         // Production Flow: Require Email Verification
                         alert("✅ 注册申请已提交！\n\n请前往您的邮箱 [" + email + "] 查收验证邮件。\n点击邮件中的链接激活账号后，即可返回此处登录。");
                         // Do NOT auto-login here. Wait for user to verify.
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
        await authService.signOut(appName);
    };

    const containerClasses = isStatic 
        ? "flex items-center gap-2"
        : "fixed top-safe-top right-4 z-40 flex items-center gap-2";

    return (
        <div className={containerClasses}>
            {user ? (
                isExpanded ? (
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm animate-fade-in">
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
                        className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                    >
                         <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                    </button>
                )
            ) : (
                <button 
                    onClick={handleLogin}
                    className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-gray-200 shadow-sm hover:bg-white transition-colors"
                >
                    <CloudOff size={10} className="text-gray-400" />
                    <span className="text-[9px] text-gray-600 font-medium">登录</span>
                </button>
            )}
        </div>
    );
};

export default AuthStatus;
