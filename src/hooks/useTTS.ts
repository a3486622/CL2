'use client';

import { useState, useCallback, useRef } from 'react';

interface UseTTSReturn {
  audioUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: (text: string, speakerId: string) => Promise<void>;
  stop: () => void;
}

export function useTTS(): UseTTSReturn {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRequestingRef = useRef(false);

  const play = useCallback(async (text: string, speakerId: string) => {
    // 如果正在请求中，忽略新的播放请求
    if (isRequestingRef.current) {
      return;
    }

    // 停止之前的播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    setError(null);
    isRequestingRef.current = true;

    // 过滤掉括号内容（表情、动作提示等）
    const cleanText = text
      .replace(/\([^)]*\)/g, '') // 去除圆括号内的内容，如（气到发抖）
      .replace(/[【】\[\]《》]/g, '') // 去除方括号和书名号
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+/gu, '') // 去除所有emoji
      .replace(/\s+/g, ' ') // 合并多余空格
      .trim();

    // 如果过滤后文本为空，跳过语音
    if (!cleanText) {
      setIsLoading(false);
      isRequestingRef.current = false;
      return;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          speakerId,
          uid: `game_${Date.now()}`,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.audioUri) {
        throw new Error('未获取到音频地址');
      }

      setAudioUrl(data.audioUri);

      // 使用 fetch 获取音频数据并创建 blob URL
      const audioResponse = await fetch(data.audioUri);
      const audioBlob = await audioResponse.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(blobUrl);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(blobUrl);
        isRequestingRef.current = false;
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setError('音频播放失败');
        URL.revokeObjectURL(blobUrl);
        isRequestingRef.current = false;
      };
      
      await audioRef.current.play();
    } catch (err) {
      const message = err instanceof Error ? err.message : '语音生成失败';
      setError(message);
      console.error('TTS error:', err);
      isRequestingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      isRequestingRef.current = false;
    }
  }, []);

  return { audioUrl, isPlaying, isLoading, error, play, stop };
}
