'use client';

import { useState, useCallback } from 'react';
import { type RoundHistory, type Message } from '@/lib/types';

interface UseReviewReturn {
  review: string | null;
  highlightMessage: Message | null;
  isGenerating: boolean;
  generateReview: (history: RoundHistory[], messages: Message[]) => Promise<void>;
}

export function useReview(): UseReviewReturn {
  const [review, setReview] = useState<string | null>(null);
  const [highlightMessage, setHighlightMessage] = useState<Message | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReview = useCallback(async (history: RoundHistory[], messages: Message[]) => {
    setIsGenerating(true);

    try {
      // 构建对话历史文本
      const historyText = history.map((h, i) => 
        `第${h.round}轮：你选择了"${h.selectedOption.text}"，好感度从${h.previousAffection}变为${h.newAffection}`
      ).join('\n');

      const reviewPrompt = `你是一个损友风格的哄人教练。请分析以下游戏记录，给出损友+暖心结合风格的复盘。

对话历史：
${historyText}

要求：
1. 先吐槽用户的翻车操作（损友风格，要有点扎心但好笑）
2. 再给予鼓励和具体建议（暖心风格）
3. 重点指出最薄弱的环节
4. 长度控制在100-200字
5. 语气俏皮，像朋友之间的对话
6. 不要太严肃，要有梗

直接输出复盘内容，不要加引号或其他格式。`;

      // 使用简单的fetch调用（这里简化处理，实际应该调用LLM）
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyText, prompt: reviewPrompt }),
      });

      if (response.ok) {
        const data = await response.json();
        setReview(data.review);
      } else {
        // 如果没有专门的review API，使用默认复盘
        setReview(generateDefaultReview(history));
      }

      // 找出最高光时刻（好感度变化最大的那轮）
      if (history.length > 0) {
        const biggestChange = history.reduce((max, h) => 
          Math.abs(h.newAffection - h.previousAffection) > Math.abs(max.newAffection - max.previousAffection) ? h : max
        , history[0]);

        // 找到对应的AI消息
        const highlightMsg = messages.find(m => m.content === biggestChange.aiMessage);
        setHighlightMessage(highlightMsg || null);
      }

    } catch (error) {
      console.error('Generate review error:', error);
      setReview(generateDefaultReview(history));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    review,
    highlightMessage,
    isGenerating,
    generateReview,
  };
}

function generateDefaultReview(history: RoundHistory[]): string {
  if (history.length === 0) return '这局太短了，没什么好复盘的...';

  const funnyCount = history.filter(h => h.selectedOption.type === 'negative_funny').length;
  const positiveCount = history.filter(h => h.selectedOption.type === 'positive').length;
  
  if (funnyCount >= 3) {
    return `你这一局选了${funnyCount}次奇葩选项，是来哄人的还是来搞笑的？不过欢乐喜剧人这个称号你是拿定了！`;
  }
  
  if (positiveCount >= 8) {
    return `不错不错，你这一局表现很稳，加分项选了${positiveCount}次，情商在线！`;
  }
  
  if (funnyCount > 0) {
    return `你这局有点意思，既有认真哄的时候，又有翻车的时候。不过没关系，哄人嘛，最重要的是真诚！`;
  }
  
  return `这局你发挥比较稳定，下次可以试着多想想对方的感受，有时候真诚比技巧更重要~`;
}
