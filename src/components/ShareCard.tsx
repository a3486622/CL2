'use client';

import { type GameResult, type Message, getAffectionRatingText, getRoundRatingText } from '@/lib/types';

interface ShareCardProps {
  result: GameResult;
  highlightMessage: Message | null;
  scenarioName: string;
}

export function ShareCard({ result, highlightMessage, scenarioName }: ShareCardProps) {
  const { won, finalAffection, rounds, affectionRating, roundRating } = result;

  return (
    <div className="bg-gradient-to-br from-[var(--macaron-pink-light)] via-[var(--macaron-lavender)] to-[var(--macaron-mint-light)] rounded-3xl p-6 text-[var(--macaron-text)] shadow-2xl border-4 border-white">
      {/* 装饰 */}
      <div className="absolute top-4 left-4 w-8 h-8 bg-[var(--macaron-yellow)]/50 rounded-full blur-sm" />
      <div className="absolute top-8 right-8 w-6 h-6 bg-[var(--macaron-pink)]/50 rounded-full blur-sm" />

      {/* 标题 */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold mb-1">
          {won ? '🎉 成功哄好啦！' : '💔 明天继续努力'}
        </h2>
        <p className="text-sm text-[var(--macaron-text-light)]">哄哄模拟器 · {scenarioName}</p>
      </div>

      {/* 评价标签 */}
      <div className="flex justify-center gap-3 mb-5">
        <span className="bg-white/80 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {getAffectionRatingText(affectionRating)}
        </span>
        <span className="bg-white/80 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {getRoundRatingText(roundRating)}
        </span>
      </div>

      {/* 数据卡片 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-5 shadow-inner">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--macaron-pink)]/10">
          <span className="text-[var(--macaron-text-light)]">最终好感度</span>
          <span className="text-2xl font-bold text-[var(--macaron-pink-dark)]">💗 {finalAffection}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--macaron-text-light)]">用时</span>
          <span className="text-lg font-bold">{rounds}轮</span>
        </div>
      </div>

      {/* 高光时刻 */}
      {highlightMessage && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 mb-5 shadow-sm">
          <p className="text-xs text-[var(--macaron-mint-dark)] font-bold mb-1">✨ 高光时刻</p>
          <p className="text-sm italic text-[var(--macaron-text)]">"{highlightMessage.content.slice(0, 60)}..."</p>
        </div>
      )}

      {/* 成就 */}
      {result.achievements && result.achievements.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {result.achievements.map((a: { id: string; name: string }) => (
            <span 
              key={a.id}
              className="bg-[var(--macaron-yellow)]/80 text-[var(--macaron-text)] text-xs px-3 py-1 rounded-full font-bold"
            >
              {a.name}
            </span>
          ))}
        </div>
      )}

      {/* 底部 */}
      <div className="text-center">
        <p className="text-xs text-[var(--macaron-text-light)]">
          💕 快来挑战10轮哄好Ta
        </p>
      </div>
    </div>
  );
}

// 下载分享卡片的函数
export async function downloadShareCard(elementId: string, filename: string) {
  return '分享功能开发中...';
}
