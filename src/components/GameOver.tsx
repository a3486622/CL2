'use client';

import { useEffect, useState } from 'react';
import { type GameResult, type Achievement } from '@/lib/types';
import { getAffectionRatingText, getRoundRatingText } from '@/lib/types';

interface GameOverProps {
  result: GameResult;
  achievements: Achievement[];
  onRetry: () => void;
  onShare: () => void;
  currentUser?: { id: number; username: string } | null;
  scenario?: string;
}

export function GameOver({ result, achievements, onRetry, onShare, currentUser, scenario }: GameOverProps) {
  const { won, finalAffection, rounds, affectionRating, roundRating } = result;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'prompt_login'>('idle');

  useEffect(() => {
    if (saveStatus !== 'idle') return;
    
    const saveRecord = async () => {
      if (currentUser) {
        setSaveStatus('saving');
        try {
          const res = await fetch('/api/game-records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              scenario: scenario || '未知场景',
              finalScore: finalAffection,
              result: won ? '通关' : '失败',
            }),
          });
          if (res.ok) {
            setSaveStatus('saved');
          } else {
            setSaveStatus('saved'); // 即使失败也不阻塞
          }
        } catch {
          setSaveStatus('saved');
        }
      } else {
        setSaveStatus('prompt_login');
      }
    };

    saveRecord();
  }, [currentUser, finalAffection, won, scenario, saveStatus]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 animate-fadeIn">
      {/* 装饰圆形 */}
      <div className="absolute top-24 left-8 w-16 h-16 bg-[var(--macaron-pink)]/20 rounded-full blur-xl" />
      <div className="absolute top-40 right-12 w-12 h-12 bg-[var(--macaron-mint)]/30 rounded-full blur-lg" />

      {/* 结果动画 */}
      <div className="text-7xl mb-6">
        {won ? (
          <span className="animate-bounce">🎉</span>
        ) : (
          <span className="animate-pulse">💔</span>
        )}
      </div>

      {/* 结果标题 */}
      <h2 className={`text-3xl font-bold mb-4 ${
        won ? 'text-[var(--macaron-mint-dark)]' : 'text-[var(--macaron-pink-dark)]'
      }`}>
        {won ? '恭喜通关！' : '再接再厉'}
      </h2>

      {/* 保存状态提示 */}
      {saveStatus === 'saved' && (
        <div className="mb-4 bg-[var(--macaron-mint)]/20 text-[var(--macaron-mint-dark)] px-4 py-2 rounded-full text-sm font-medium animate-fadeIn">
          ✅ 您的游戏记录已经保存
        </div>
      )}
      {saveStatus === 'prompt_login' && (
        <div className="mb-4 bg-[var(--macaron-yellow)]/30 text-[var(--macaron-text)] px-4 py-2 rounded-full text-sm font-medium animate-fadeIn flex items-center gap-2">
          <span>💡 登录后可保存你的游戏记录</span>
          <a href="/login" className="underline font-bold hover:text-[var(--macaron-pink-dark)]">去登录</a>
        </div>
      )}

      {/* 评价标签 */}
      <div className="flex gap-3 mb-8">
        <div className="bg-gradient-to-r from-[var(--macaron-pink-light)] to-[var(--macaron-pink)] text-white px-5 py-2 rounded-full font-bold shadow-md">
          {getAffectionRatingText(affectionRating)}
        </div>
        <div className="bg-gradient-to-r from-[var(--macaron-mint-light)] to-[var(--macaron-mint)] text-white px-5 py-2 rounded-full font-bold shadow-md">
          {getRoundRatingText(roundRating)}
        </div>
      </div>

      {/* 数据卡片 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-[var(--macaron-pink)]/20 mb-8 w-full max-w-xs">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--macaron-pink)]/10">
          <span className="text-[var(--macaron-text-light)]">最终好感度</span>
          <span className={`text-2xl font-bold ${
            finalAffection >= 80 ? 'text-[var(--macaron-mint-dark)]' : 'text-[var(--macaron-pink-dark)]'
          }`}>
            💗 {finalAffection}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--macaron-text-light)]">用时</span>
          <span className="text-xl font-bold text-[var(--macaron-text)]">{rounds}轮</span>
        </div>
      </div>

      {/* 成就展示 */}
      {achievements.length > 0 && (
        <div className="w-full max-w-xs mb-8">
          <h3 className="text-sm text-[var(--macaron-text-light)] mb-3 text-center">
            🌟 解锁成就
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {achievements.map((a) => (
              <span 
                key={a.id}
                className="bg-gradient-to-r from-[var(--macaron-yellow)] to-[var(--macaron-peach)] text-[var(--macaron-text)] text-xs px-3 py-1.5 rounded-full font-bold shadow-sm"
              >
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="flex-1 py-4 px-6 bg-white text-[var(--macaron-text)] rounded-2xl font-bold shadow-md border-2 border-[var(--macaron-pink)]/30 hover:bg-[var(--macaron-pink-light)]/30 transition-all active:scale-95"
        >
          再试一次
        </button>
        <button
          onClick={onShare}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          分享成果 ✨
        </button>
      </div>
    </div>
  );
}
