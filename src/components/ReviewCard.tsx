'use client';

interface ReviewCardProps {
  review: string;
  isLoading?: boolean;
}

export function ReviewCard({ review, isLoading }: ReviewCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[var(--macaron-lavender)]/30">
      <h3 className="text-sm font-bold text-[var(--macaron-text)] mb-3 flex items-center gap-2">
        <span>📝</span>
        <span>复盘点评</span>
      </h3>
      
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 bg-[var(--macaron-pink-light)]/50 rounded-full animate-pulse" />
          <div className="h-4 bg-[var(--macaron-mint-light)]/50 rounded-full animate-pulse w-3/4" />
          <div className="h-4 bg-[var(--macaron-lavender)]/50 rounded-full animate-pulse w-1/2" />
        </div>
      ) : (
        <p className="text-sm text-[var(--macaron-text)] leading-relaxed whitespace-pre-wrap">
          {review}
        </p>
      )}
    </div>
  );
}
