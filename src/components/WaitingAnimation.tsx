'use client';

import { type OptionType } from '@/lib/types';

interface WaitingAnimationProps {
  type: OptionType;
}

export function WaitingAnimation({ type }: WaitingAnimationProps) {
  const getContent = () => {
    switch (type) {
      case 'positive':
        return {
          text: '对方正在心软中...',
          dotColor: 'bg-[var(--macaron-mint)]',
          bgColor: 'bg-[var(--macaron-mint-light)]',
        };
      case 'negative_normal':
        return {
          text: '...',
          dotColor: 'bg-[var(--macaron-text-light)]',
          bgColor: 'bg-[var(--macaron-pink-light)]',
        };
      case 'negative_funny':
        return {
          text: '？？？对方已读不回',
          dotColor: 'bg-[var(--macaron-pink)]',
          bgColor: 'bg-[var(--macaron-lavender)]',
        };
    }
  };

  const content = getContent();

  return (
    <div className={`flex items-center gap-3 py-3 px-4 rounded-2xl ${content.bgColor}/50 max-w-fit animate-fadeIn`}>
      <div className="flex gap-1.5">
        <span 
          className={`w-2 h-2 ${content.dotColor} rounded-full animate-bounce`} 
          style={{ animationDelay: '0ms' }} 
        />
        <span 
          className={`w-2 h-2 ${content.dotColor} rounded-full animate-bounce`} 
          style={{ animationDelay: '150ms' }} 
        />
        <span 
          className={`w-2 h-2 ${content.dotColor} rounded-full animate-bounce`} 
          style={{ animationDelay: '300ms' }} 
        />
      </div>
      <span className={`text-sm text-[var(--macaron-text-light)]`}>
        {content.text}
      </span>
    </div>
  );
}
