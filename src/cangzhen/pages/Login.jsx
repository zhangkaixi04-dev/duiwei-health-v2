import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await authService.signUp(email, password, 'cangzhen');
        if (signUpError) {
          if (signUpError.message.includes('Email not confirmed')) {
            alert("✅ 注册申请已提交！\n\n请前往您的邮箱查收验证邮件。\n点击邮件中的链接激活账号后，即可返回此处登录。");
            setIsSignUp(false);
          } else {
            throw signUpError;
          }
        } else {
          alert("✅ 注册申请已提交！\n\n请前往您的邮箱查收验证邮件。\n点击邮件中的链接激活账号后，即可返回此处登录。");
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await authService.signIn(email, password, 'cangzhen');
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('账号或密码错误');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('请先验证您的邮箱');
          } else {
            throw signInError;
          }
        } else {
          navigate('/cangzhen');
        }
      }
    } catch (err) {
      setError(err.message || '操作失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center p-6 font-serif">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 glass-convex p-2 rounded-full text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="glass-convex rounded-3xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-cangzhen-text-main mb-2 tracking-widest">
              {isSignUp ? '注册' : '登录'}
            </h1>
            <p className="text-sm text-cangzhen-text-secondary/80">
              {isSignUp ? '创建您的藏真账号' : '欢迎回到藏真'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-cangzhen-text-secondary/70 mb-2 tracking-wider">邮箱</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cangzhen-text-secondary/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/40 border border-white/60 rounded-xl text-cangzhen-text-main placeholder:text-cangzhen-text-secondary/40 focus:outline-none focus:bg-white/60 focus:border-cangzhen-text-main/30 transition-all"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-cangzhen-text-secondary/70 mb-2 tracking-wider">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cangzhen-text-secondary/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/40 border border-white/60 rounded-xl text-cangzhen-text-main placeholder:text-cangzhen-text-secondary/40 focus:outline-none focus:bg-white/60 focus:border-cangzhen-text-main/30 transition-all"
                  placeholder="请输入密码"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cangzhen-text-secondary/50 hover:text-cangzhen-text-main transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs text-center py-2 bg-red-50 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 rounded-2xl bg-cangzhen-text-main text-white text-sm font-medium tracking-[0.2em] shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '处理中...' : (isSignUp ? '注册' : '登录')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-cangzhen-text-secondary hover:text-cangzhen-text-main transition-colors"
            >
              {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
