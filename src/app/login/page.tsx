'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFDEE9] via-[#B5FFFC] to-[#E2D1F9] flex items-center justify-center p-4">
      {/* Floating decorations */}
      <div className="fixed top-10 left-10 w-20 h-20 rounded-full bg-[#FFB5C5]/30 animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="fixed top-32 right-16 w-16 h-16 rounded-full bg-[#B5EAD7]/30 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      <div className="fixed bottom-20 left-20 w-24 h-24 rounded-full bg-[#E2D1F9]/30 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
      <div className="fixed bottom-32 right-10 w-14 h-14 rounded-full bg-[#FFDAC1]/30 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '2s' }} />

      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💕</div>
          <h1 className="text-3xl font-bold text-[#FFD700]">哄哄模拟器</h1>
          <p className="text-[#B07AA1] mt-2 text-sm">欢迎回来，快来哄人吧</p>
        </div>

        {/* Login card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
          <h2 className="text-xl font-bold text-[#E8578A] text-center mb-6">登录</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#8B5E83] mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入你的用户名"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD1DC] bg-[#FFF5F7] text-[#5A3D52] placeholder-[#D4A9C9] focus:border-[#FFB5C5] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B5E83] mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入你的密码"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#FFD1DC] bg-[#FFF5F7] text-[#5A3D52] placeholder-[#D4A9C9] focus:border-[#FFB5C5] focus:outline-none transition-colors"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-2.5 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#07C160] text-white font-bold text-lg shadow-md hover:bg-[#06AD56] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#B07AA1]">
              还没有账号？
              <a href="/register" className="text-[#E8578A] font-bold hover:underline ml-1">
                立即注册
              </a>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[#B07AA1] hover:text-[#E8578A] transition-colors">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
