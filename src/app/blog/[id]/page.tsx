'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface BlogArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  emoji: string | null;
  tag: string | null;
  created_at: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = Number(params.id);

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/blog/${articleId}`);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setArticle(data.article);
        }
      } catch {
        setError('加载失败，请重试');
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticle();
  }, [articleId]);

  // 将文章内容按段落分割渲染
  const renderContent = (content: string) => {
    const paragraphs = content.split(/\n+/).filter((p: string) => p.trim());
    return paragraphs.map((paragraph: string, index: number) => (
      <p key={index} className="text-[var(--macaron-text)] leading-8 text-[15px] mb-4 animate-slideUp" style={{ animationDelay: `${index * 80}ms` }}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--macaron-pink-light)] via-[var(--macaron-bg)] to-[var(--macaron-mint-light)]">
      {/* 装饰 */}
      <div className="absolute top-32 left-6 w-16 h-16 bg-[var(--macaron-lavender)]/20 rounded-full blur-xl" />
      <div className="absolute top-52 right-10 w-12 h-12 bg-[var(--macaron-pink)]/20 rounded-full blur-lg" />

      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] text-[var(--macaron-text)] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold">恋爱攻略</span>
        </div>
        <span className="text-xs bg-white/60 px-3 py-1 rounded-full">
          {article?.tag || '加载中'}
        </span>
      </div>

      {/* 内容区域 */}
      <div className="max-w-lg mx-auto px-5 py-8">
        {isLoading && (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[var(--macaron-pink-light)] rounded-3xl mx-auto mb-4 animate-pulse" />
              <div className="h-7 bg-[var(--macaron-pink-light)]/50 rounded-full animate-pulse w-3/4 mx-auto mb-3" />
              <div className="h-5 bg-[var(--macaron-mint-light)]/50 rounded-full animate-pulse w-1/3 mx-auto" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-[var(--macaron-lavender)]/30 rounded-full animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">😢</div>
            <p className="text-[var(--macaron-text-light)]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-full font-bold active:scale-95 transition-transform"
            >
              重新加载
            </button>
          </div>
        )}

        {article && !isLoading && (
          <div className="animate-fadeIn">
            {/* 文章头部 */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-lg">
                {article.emoji}
              </div>
              <h1 className="text-2xl font-bold text-[var(--macaron-text)] mb-3 leading-snug">
                {article.title}
              </h1>
              <div className="flex items-center justify-center gap-3 text-sm text-[var(--macaron-text-light)]">
                <span className="bg-[var(--macaron-mint)]/20 text-[var(--macaron-mint-dark)] px-3 py-1 rounded-full font-bold">
                  {article.tag}
                </span>
                <span>📖 3分钟阅读</span>
              </div>
            </div>

            {/* 分割线 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--macaron-pink)]/30 to-transparent" />
              <span className="text-[var(--macaron-pink)] text-xs">💕</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--macaron-pink)]/30 to-transparent" />
            </div>

            {/* 文章内容 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-[var(--macaron-pink)]/10">
              {renderContent(article.content)}
            </div>

            {/* 底部互动区 */}
            <div className="mt-8 text-center">
              <p className="text-[var(--macaron-text-light)] text-sm mb-4">觉得有用？来练习一下吧</p>
              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                开始哄人练习 🎮
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
