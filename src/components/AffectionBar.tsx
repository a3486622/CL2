'use client';

import { useEffect, useState } from 'react';
import { type AffectionZone } from '@/lib/types';

interface AffectionBarProps {
  affection: number;
  maxRounds: number;
  currentRound: number;
}

export function AffectionBar({ affection, maxRounds, currentRound }: AffectionBarProps) {
  const [displayedAffection, setDisplayedAffection] = useState(affection);
  const [changeIndicator, setChangeIndicator] = useState<'up' | 'down' | null>(null);

  // 好感度动画
  useEffect(() => {
    if (displayedAffection !== affection) {
      const diff = affection - displayedAffection;
      const step = diff > 0 ? 2 : -2;
      
      const timer = setInterval(() => {
        setDisplayedAffection(prev => {
          const next = prev + step;
          if ((step > 0 && next >= affection) || (step < 0 && next <= affection)) {
            clearInterval(timer);
            return affection;
          }
          return next;
        });
        
        setChangeIndicator(diff > 0 ? 'up' : 'down');
      }, 30);
	
      setTimeout(() => setChangeIndicator(null), 2000);

      return () => clearInterval(timer);
    }
  }, [affection, displayedAffection]);

  // 计算进度百分比
  const percentage = ((displayedAffection + 50) / 150) * 100;

  // 获取当前情绪区 - 马卡龙配色
  const getZone = (): AffectionZone => {
    if (displayedAffection < 0) return 'very_angry';
    if (displayedAffection < 30) return 'angry';
    if (displayedAffection < 60) return 'softening';
    if (displayedAffection < 80) return 'almost_forgiven';
    return 'forgiven';
  };

  // 马卡龙风格颜色 - 高对比度
  const getZoneColor = (): string => {
    switch (getZone()) {
      case 'very_angry': return '#E74C3C';
      case 'angry': return '#E67E22';
      case 'softening': return '#F1C40F';
      case 'almost_forgiven': return '#2ECC71';
      case 'forgiven': return '#9B59B6';
    }
  };

  // 获取情绪标签
  const getZoneLabel = (): string => {
    switch (getZone()) {
      case 'very_angry': return '非常生气 💢';
      case 'angry': return '有点生气 😤';
      case 'softening': return '逐渐心软 🥺';
      case 'almost_forgiven': return '快要原谅 😊';
      case 'forgiven': return '原谅啦 💕';
    }
  };

  return (
    <div className="px-4 py-4">
      {/* 情绪标签 - 放大醒目 */}
      <div className="text-center mb-4">
        <span 
          className="text-xl font-bold px-6 py-2 rounded-full inline-block transition-all duration-300 shadow-md"
          style={{ 
            backgroundColor: `${getZoneColor()}30`,
            color: getZoneColor(),
          }}
        >
          {getZoneLabel()}
        </span>
      </div>

      {/* 进度条 - 马卡龙渐变风格 */}
      <div className="relative h-4 bg-white rounded-full overflow-hidden shadow-inner border-2 border-[var(--macaron-pink)]/20">
        {/* 彩虹渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] via-[#FFE066] via-[#A8E6CF] to-[#88D8B0]" />
        
        {/* 目标区域标记 */}
        <div 
          className="absolute right-0 top-0 bottom-0 bg-white/30 border-l-2 border-dashed border-white/50"
          style={{ width: '20%' }}
        />

        {/* 当前进度 - 玻璃质感 */}
        <div 
          className="absolute h-full rounded-full transition-all duration-500 ease-out backdrop-blur-sm"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getZoneColor(),
            boxShadow: `0 0 12px ${getZoneColor()}80`,
          }}
        >
          {/* 高光效果 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-full" />
        </div>
      </div>

      {/* 状态文字 - 放大醒目 */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          <span 
            className="text-lg font-bold transition-colors duration-200 px-3 py-1 rounded-full shadow-sm"
            style={{ 
              backgroundColor: `${getZoneColor()}20`,
              color: getZoneColor(),
            }}
          >
            💗 {displayedAffection}
          </span>
          {changeIndicator && (
            <span 
              className={`text-xl font-bold animate-bounce`}
              style={{ color: getZoneColor() }}
            >
              {changeIndicator === 'up' ? '↑' : '↓'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--macaron-text-light)] font-medium">
            第 {currentRound}/{maxRounds} 轮
          </span>
          <span className="text-sm text-[var(--macaron-mint-dark)] bg-[var(--macaron-mint)]/20 px-3 py-1 rounded-full font-bold">
            目标 80 💕
          </span>
        </div>
      </div>
    </div>
  );
}
