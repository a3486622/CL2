'use client';

import { useState, useCallback, useMemo } from 'react';
import { type Achievement, type RoundHistory, ACHIEVEMENTS } from '@/lib/types';

interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  checkAchievements: (history: RoundHistory[], won: boolean, finalAffection: number, retryCount: number, voiceChangeCount: number) => void;
  resetAchievements: () => void;
}

export function useAchievements(): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>(() => 
    ACHIEVEMENTS.map(a => ({
      id: a.id,
      name: '', // 未解锁时不显示名字
      description: a.description,
      unlocked: false,
    }))
  );

  const unlockedAchievements = useMemo(() => 
    achievements.filter(a => a.unlocked),
    [achievements]
  );

  const checkAchievements = useCallback((
    history: RoundHistory[], 
    won: boolean, 
    finalAffection: number,
    retryCount: number,
    voiceChangeCount: number
  ) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement;

      const achievementDef = ACHIEVEMENTS.find(a => a.id === achievement.id);
      if (!achievementDef) return achievement;

      let conditionMet = false;
      
      // 根据成就ID判断
      switch (achievement.id) {
        case 'zero_mistake':
        case 'comedy_king':
        case 'mediocre':
        case 'emotion_master':
        case 'comeback':
        case 'barely_pass':
        case 'apology_master':
        case 'compensation_master':
        case 'excuse_master':
          conditionMet = achievementDef.condition(history, won, finalAffection);
          break;
        case 'retry_master':
          conditionMet = retryCount > 0;
          break;
        case 'voice_fan':
          conditionMet = voiceChangeCount >= 3;
          break;
        // explorer 需要额外的状态追踪，暂时不实现
        case 'explorer':
          conditionMet = false;
          break;
      }

      if (conditionMet) {
        // 随机选择名字
        const randomName = achievementDef.names[
          Math.floor(Math.random() * achievementDef.names.length)
        ];
        return {
          ...achievement,
          name: randomName,
          unlocked: true,
          unlockedAt: Date.now(),
        };
      }

      return achievement;
    }));
  }, []);

  const resetAchievements = useCallback(() => {
    setAchievements(prev => prev.map(a => ({
      ...a,
      unlocked: false,
      unlockedAt: undefined,
      name: '',
    })));
  }, []);

  return {
    achievements,
    unlockedAchievements,
    checkAchievements,
    resetAchievements,
  };
}
