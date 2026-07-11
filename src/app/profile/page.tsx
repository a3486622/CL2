'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

interface UserInfo {
  id: number;
  username: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored) as UserInfo;
    setUser(parsed);

    fetch(`/api/game-records?userId=${parsed.id}`)
      .then(res => res.json())
      .then(data => {
        setRecords(data.records || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[var(--macaron-mint-dark)]';
    if (score >= 60) return 'text-[var(--macaron-lavender-dark,#7c3aed)]';
    if (score >= 40) return 'text-[var(--macaron-yellow)]';
    return 'text-[var(--macaron-pink-dark)]';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-[var(--macaron-mint)]/20 border-[var(--macaron-mint)]/30';
    if (score >= 60) return 'bg-[var(--macaron-lavender)]/20 border-[var(--macaron-lavender)]/30';
    if (score >= 40) return 'bg-[var(--macaron-yellow)]/20 border-[var(--macaron-yellow)]/30';
    return 'bg-[var(--macaron-pink)]/20 border-[var(--macaron-pink)]/30';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!user) return null;

  const totalGames = records.length;
  const winGames = records.filter(r => r.result === '通关').length;
  const avgScore = totalGames > 0 ? Math.round(records.reduce((sum, r) => sum + r.final_score, 0) / totalGames) : 0;

  return (
    <div className="min-h-screen bg-[var(--macaron-bg)]">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] text-[var(--macaron-text)] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="p-1 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold">💕 我的主页</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-white/60 px-3 py-1 rounded-full active:scale-90 transition-all"
        >
          退出登录
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 用户信息卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-[var(--macaron-pink)]/20 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--macaron-pink)] to-[var(--macaron-lavender)] rounded-2xl flex items-center justify-center text-3xl shadow-md">
              😎
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--macaron-text)]">{user.username}</h2>
              <p className="text-sm text-[var(--macaron-text-light)]">哄哄模拟器玩家</p>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--macaron-pink-light)]/20 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-[var(--macaron-pink-dark)]">{totalGames}</div>
              <div className="text-xs text-[var(--macaron-text-light)] mt-1">总场次</div>
            </div>
            <div className="bg-[var(--macaron-mint)]/20 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-[var(--macaron-mint-dark)]">{winGames}</div>
              <div className="text-xs text-[var(--macaron-text-light)] mt-1">通关数</div>
            </div>
            <div className="bg-[var(--macaron-lavender)]/20 rounded-2xl p-3 text-center">
              <div className="text-2xl font-bold text-[var(--macaron-lavender-dark,#7c3aed)]">{avgScore}</div>
              <div className="text-xs text-[var(--macaron-text-light)] mt-1">平均分</div>
            </div>
          </div>
        </div>

        {/* 游戏记录列表 */}
        <h3 className="text-lg font-bold text-[var(--macaron-text)] mb-4">🎮 游戏记录</h3>

        {loading ? (
          <div className="text-center py-12 text-[var(--macaron-text-light)]">
            <div className="text-4xl mb-3 animate-bounce">📝</div>
            加载中...
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-[var(--macaron-text-light)] mb-4">还没有游戏记录</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white px-6 py-3 rounded-2xl font-bold shadow-md active:scale-95 transition-all"
            >
              开始第一局 💕
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border ${getScoreBg(record.final_score)} transition-all`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {record.result === '通关' ? '🎉' : '💔'}
                    </span>
                    <span className="font-bold text-[var(--macaron-text)]">{record.scenario}</span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    record.result === '通关'
                      ? 'bg-[var(--macaron-mint)]/20 text-[var(--macaron-mint-dark)]'
                      : 'bg-[var(--macaron-pink)]/20 text-[var(--macaron-pink-dark)]'
                  }`}>
                    {record.result}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--macaron-text-light)]">{formatDate(record.played_at)}</span>
                  <span className={`font-bold ${getScoreColor(record.final_score)}`}>
                    💗 {record.final_score}分
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
