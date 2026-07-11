'use client';

import { useState, useCallback, useRef } from 'react';
import { 
  type GameState, 
  type Message, 
  type Option, 
  type RoundHistory,
  type Gender,
  type Scenario,
  type VoiceType,
  SCENARIOS,
  VOICE_TYPES,
  getEmotionLevel,
} from '@/lib/types';

const INITIAL_AFFECTION = 20;
const MAX_ROUNDS = 10;
const WIN_AFFECTION = 80;
const LOSE_AFFECTION = -50;

interface UseGameReturn {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  startGame: (gender: Gender, scenarioId: string, voiceTypeId: string) => Promise<void>;
  selectOption: (option: Option) => Promise<void>;
  undo: () => void;
  resetGame: () => void;
  canUndo: boolean;
  retryCount: number;
  voiceChangeCount: number;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [voiceChangeCount, setVoiceChangeCount] = useState(0);
  const undoStackRef = useRef<GameState[]>([]);

  const startGame = useCallback(async (gender: Gender, scenarioId: string, voiceTypeId: string) => {
    setIsLoading(true);
    setError(null);
    undoStackRef.current = [];

    const scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    const voiceType = VOICE_TYPES.find(v => v.id === voiceTypeId) || VOICE_TYPES[0];

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          gender,
          scenario: scenarioId,
        }),
      });

      const data = await response.json();

      const initialMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'ai',
        content: data.aiMessage,
      };

      setGameState({
        gender,
        scenario,
        voiceType,
        round: 1,
        maxRounds: MAX_ROUNDS,
        affection: INITIAL_AFFECTION,
        messages: [initialMessage],
        options: data.options || [],
        isWaiting: false,
        waitType: null,
        usedOptions: [],
        history: [],
        personality: data.style,
      });
    } catch (err) {
      setError('启动游戏失败，请重试');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectOption = useCallback(async (option: Option) => {
    if (!gameState || gameState.isWaiting) return;

    // 保存当前状态用于回退
    undoStackRef.current.push(JSON.parse(JSON.stringify(gameState)));

    // 添加用户消息
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: option.text,
    };

    // 计算新的好感度
    const previousAffection = gameState.affection;
    let newAffection = previousAffection + option.scoreChange;
    newAffection = Math.max(-50, Math.min(100, newAffection));

    // 更新状态（等待中）
    setGameState(prev => prev ? {
      ...prev,
      isWaiting: true,
      waitType: option.type,
      affection: newAffection,
      messages: [...prev.messages, userMessage],
      usedOptions: [...prev.usedOptions, option.text],
    } : null);

    // 固定2-3秒等待
    const waitTime = 2000 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // 检查是否游戏结束（好感度达到条件）
    const won = newAffection >= WIN_AFFECTION;
    const lost = newAffection <= LOSE_AFFECTION;

    if (won || lost) {
      // 游戏已经结束
      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'ai',
        content: won ? '好吧...这次就原谅你了，下次不许再犯了哦～' : '我真的...很失望。',
        emotion: getEmotionLevel(newAffection),
      };

      const roundHistory: RoundHistory = {
        round: gameState.round,
        selectedOption: option,
        aiMessage: aiMessage.content,
        previousAffection,
        newAffection,
      };

      setGameState(prev => prev ? {
        ...prev,
        round: gameState.round + 1,
        affection: newAffection,
        messages: [...prev.messages, aiMessage],
        options: [],
        isWaiting: false,
        waitType: null,
        history: [...prev.history, roundHistory],
      } : null);
      return;
    }

    // 继续生成下一句
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'continue',
          gender: gameState.gender,
          scenario: gameState.scenario.id,
          round: gameState.round + 1,
          messages: [...gameState.messages, userMessage],
          options: gameState.options,
          usedOptions: [...gameState.usedOptions, option.text],
          currentAffection: newAffection,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'ai',
        content: data.aiMessage,
        emotion: getEmotionLevel(newAffection),
      };

      // 记录历史
      const roundHistory: RoundHistory = {
        round: gameState.round,
        selectedOption: option,
        aiMessage: data.aiMessage,
        previousAffection,
        newAffection,
      };

      const newRound = gameState.round + 1;
      const isGameEnd = data.isGameEnd || newRound > MAX_ROUNDS;

      setGameState(prev => prev ? {
        ...prev,
        round: newRound,
        affection: newAffection,
        messages: [...prev.messages, aiMessage],
        options: data.options || [],
        isWaiting: false,
        waitType: null,
        history: [...prev.history, roundHistory],
        personality: data.style,
      } : null);

    } catch (err) {
      setError('生成回复失败，请重试');
      console.error(err);
    }
  }, [gameState]);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    
    const previousState = undoStackRef.current.pop();
    if (previousState) {
      setGameState(previousState);
      setRetryCount(prev => prev + 1);
    }
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
    setError(null);
    undoStackRef.current = [];
    setRetryCount(0);
  }, []);

  return {
    gameState,
    isLoading,
    error,
    startGame,
    selectOption,
    undo,
    resetGame,
    canUndo: undoStackRef.current.length > 0,
    retryCount,
    voiceChangeCount,
  };
}
