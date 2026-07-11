'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BlogArticle {
  id: number;
  title: string;
  summary: string;
  emoji: string | null;
  tag: string | null;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setArticles(data.articles);
        }
      } catch {
        setError('加载失败，请重试');
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/generate', { method: 'POST' });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        // 将新文章插入到列表顶部
        setArticles(prev => [data.article, ...prev]);
      }
    } catch {
      setError('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--macaron-pink-light)] via-[var(--macaron-bg)] to-[var(--macaron-mint-light)]">
      {/* 装饰圆形 */}
      <div className="absolute top-20 left-8 w-20 h-20 bg-[var(--macaron-pink)]/20 rounded-full blur-2xl" />
      <div className="absolute top-40 right-12 w-16 h-16 bg-[var(--macaron-mint)]/30 rounded-full blur-xl" />
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-[var(--macaron-lavender)]/30 rounded-full blur-2xl" />

      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] text-[var(--macaron-text)] px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <button onClick={() => router.back()} className="p-1 active:scale-90 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-bold text-lg">💕 恋爱攻略</span>
      </div>

      {/* 内容区域 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 标题区 */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📖</div>
          <h1 className="text-2xl font-bold text-[var(--macaron-text)] mb-2">恋爱攻略</h1>
          <p className="text-[var(--macaron-text-light)] text-sm">学会这些，哄人再也不发愁</p>
        </div>

        {/* 生成新文章按钮 */}
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI正在写作中...
              </>
            ) : (
              <>
                ✨ AI生成新攻略
              </>
            )}
          </button>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-[var(--macaron-pink)]/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--macaron-pink-light)] rounded-2xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-[var(--macaron-pink-light)]/50 rounded-full animate-pulse w-3/4" />
                    <div className="h-4 bg-[var(--macaron-mint-light)]/50 rounded-full animate-pulse w-full" />
                    <div className="h-4 bg-[var(--macaron-lavender)]/50 rounded-full animate-pulse w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 错误状态 */}
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

        {/* 文章列表 */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/blog/${article.id}`}
                className="block bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-[var(--macaron-pink)]/10 hover:shadow-xl active:scale-[0.98] transition-all animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {article.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs bg-gradient-to-r from-[var(--macaron-mint-light)] to-[var(--macaron-mint)] text-white px-2.5 py-0.5 rounded-full font-bold">
                        {article.tag}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--macaron-text)] mb-1.5 leading-snug">
                      {article.title}
                    </h2>
                    <p className="text-sm text-[var(--macaron-text-light)] leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[var(--macaron-text-light)] shrink-0 mt-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 底部装饰 */}
        <div className="text-center mt-10 text-[var(--macaron-text-light)] text-xs">
          <p>💕 学会爱人，也是一种超能力</p>
        </div>
      </div>
    </div>
  );
}
