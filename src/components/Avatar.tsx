'use client';

import React from 'react';
import { type Gender } from '@/lib/types';

interface AvatarProps {
  role: 'ai' | 'user';
  gender?: Gender;
  size?: 'sm' | 'md' | 'lg';
}

// 马卡龙风格的emoji头像
export function Avatar({ role, gender, size = 'md' }: AvatarProps) {
  const sizeClass = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-lg',
    lg: 'w-14 h-14 text-xl',
  };

  if (role === 'ai') {
    // AI头像：根据性别显示不同emoji
    const emoji = gender === 'girlfriend' ? '😊' : '😎';
    return (
      <div className={`${sizeClass[size]} rounded-full bg-gradient-to-br from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white`}>
        <span>{emoji}</span>
      </div>
    );
  }

  // 用户头像
  return (
    <div className={`${sizeClass[size]} rounded-full bg-gradient-to-br from-[var(--macaron-mint-light)] to-[var(--macaron-mint)] flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white`}>
      <span>😎</span>
    </div>
  );
}
