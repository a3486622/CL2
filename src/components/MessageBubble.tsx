'use client';

import { useEffect, useState, useRef } from 'react';
import { type Message, type Gender } from '@/lib/types';
import { Avatar } from './Avatar';

interface MessageBubbleProps {
  message: Message;
  gender?: Gender;
  onAudioClick?: () => void;
  isPlaying?: boolean;
  isLoadingAudio?: boolean;
  autoPlay?: boolean;
}

export function MessageBubble({ 
  message, 
  gender,
  onAudioClick,
  isPlaying = false,
  isLoadingAudio = false,
  autoPlay = false,
}: MessageBubbleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(message.role === 'ai');
  const hasAutoPlayed = useRef(false);

  // 打字机效果 - 更流畅
  useEffect(() => {
    if (message.role === 'user') {
      setDisplayedText(message.content);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    hasAutoPlayed.current = false;
    
    let index = 0;
    const text = message.content;
    const speed = 30 + Math.random() * 20;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [message.content, message.role]);

  // 自动播放语音
  useEffect(() => {
    if (!autoPlay || message.role !== 'ai' || !onAudioClick || hasAutoPlayed.current) return;
    
    const timer = setTimeout(() => {
      if (!isTyping && displayedText === message.content) {
        hasAutoPlayed.current = true;
        onAudioClick();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [autoPlay, message.role, message.content, isTyping, displayedText, onAudioClick]);

  const isAi = message.role === 'ai';

  return (
    <div className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'} animate-slideIn`}>
      <Avatar role={message.role} gender={gender} />
      
      <div className={`max-w-[75%] ${isAi ? '' : 'items-end'}`}>
        <div
          className={`px-4 py-3 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            isAi
              ? 'bg-white text-[var(--macaron-text)] rounded-tl-sm border border-[var(--macaron-pink)]/20'
              : 'bg-gradient-to-br from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-tr-sm shadow-md'
          }`}
        >
          <p className="text-[15px] leading-6">
            {displayedText}
            {isTyping && (
              <span className="inline-flex ml-1">
                <span className="w-1.5 h-1.5 bg-[var(--macaron-pink)] rounded-full animate-pulse" />
              </span>
            )}
          </p>
        </div>
        
        {/* 音频播放按钮 - 马卡龙风格 */}
        {isAi && onAudioClick && (
          <button
            onClick={onAudioClick}
            disabled={isLoadingAudio}
            className="mt-2 flex items-center gap-1.5 text-xs text-[var(--macaron-text-light)] hover:text-[var(--macaron-pink)] transition-colors active:scale-90 disabled:opacity-50 bg-[var(--macaron-pink-light)]/50 px-2 py-1 rounded-full"
          >
            {isLoadingAudio ? (
              <span className="animate-pulse">...</span>
            ) : isPlaying ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
            <span>语音</span>
          </button>
        )}
      </div>
    </div>
  );
}
