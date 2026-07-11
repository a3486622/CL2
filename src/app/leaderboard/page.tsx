'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  bestScore: number;
  achievedAt: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // 获取当前登录用户
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUserId(user.id);
      }
    } catch {}

    // 获取排行榜数据
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--macaron-pink)] via-[var(--macaron-lavender)] to-[var(--macaron-mint)]">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-[var(--macaron-pink)]/20">
        <div className="max-w-lg mx-auto flex items-center px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-[var(--macaron-text)] hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold text-sm">返回</span>
          </button>
          <h1 className="flex-1 text-center font-black text-[var(--macaron-text)] text-lg">
            🏆 排行榜
          </h1>
          <div className="w-14" />
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 顶部装饰 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg border border-[var(--macaron-gold)]/30">
            <span className="text-2xl">👑</span>
            <span className="font-black text-[var(--macaron-text)] text-base">哄人高手榜</span>
            <span className="text-2xl">👑</span>
          </div>
          <p className="text-[var(--macaron-text-light)] text-xs mt-2">按最高好感度分数排名 · TOP 20</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin text-4xl">🌸</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-[var(--macaron-text-light)] font-bold">还没有人上榜</p>
            <p className="text-[var(--macaron-text-light)] text-sm mt-1">快去游戏成为第一个上榜的人吧！</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white font-bold rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              开始游戏
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentUser = currentUserId === entry.userId;
              const rankIcon = getRankIcon(entry.rank);

              return (
                <div
                  key={entry.rank}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-md transition-all
                    ${isCurrentUser
                      ? 'bg-gradient-to-r from-[var(--macaron-pink)]/90 to-[var(--macaron-lavender)]/90 text-white shadow-lg scale-[1.02] border-2 border-white/50'
                      : entry.rank <= 3
                        ? 'bg-white/80 backdrop-blur-sm border border-[var(--macaron-gold)]/30'
                        : 'bg-white/60 backdrop-blur-sm border border-gray-100'
                    }
                  `}
                >
                  {/* 排名 */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg
                    ${isCurrentUser
                      ? 'bg-white/30 text-white'
                      : entry.rank === 1
                        ? 'bg-yellow-100 text-yellow-600'
                        : entry.rank === 2
                          ? 'bg-gray-100 text-gray-500'
                          : entry.rank === 3
                            ? 'bg-orange-100 text-orange-500'
                            : 'bg-gray-50 text-gray-400'
                    }
                  `}>
                    {rankIcon || entry.rank}
                  </div>

                  {/* 用户名 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm truncate ${isCurrentUser ? 'text-white' : 'text-[var(--macaron-text)]'}`}>
                        {entry.username}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 bg-white/30 rounded-full text-[10px] font-bold">我</span>
                      )}
                    </div>
                    <span className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-gray-400'}`}>
                      {formatDate(entry.achievedAt)}
                    </span>
                  </div>

                  {/* 分数 */}
                  <div className={`
                    flex-shrink-0 text-right
                    ${isCurrentUser ? 'text-white' : getScoreColor(entry.bestScore)}
                  `}>
                    <div className="font-black text-xl leading-tight">
                      {entry.bestScore}
                    </div>
                    <div className={`text-[10px] ${isCurrentUser ? 'text-white/60' : 'text-gray-400'}`}>
                      好感度
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 底部提示 */}
        {!currentUserId && leaderboard.length > 0 && (
          <div className="mt-6 text-center bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-md">
            <p className="text-[var(--macaron-text-light)] text-sm">💡 登录后你的成绩才能上榜哦</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-2 px-5 py-2 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              去登录
            </button>
          </div>
        )}

        {/* 底部间距 */}
        <div className="h-8" />
      </div>
    </div>
  );
}
