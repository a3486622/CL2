'use client';

import { useEffect, useState } from 'react';
import { type Achievement } from '@/lib/types';

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 3秒后自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-xs opacity-80">成就解锁</p>
          <p className="font-bold">{achievement.name}</p>
        </div>
      </div>
    </div>
  );
}
