'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { useTTS } from '@/hooks/useTTS';
import { useAchievements } from '@/hooks/useAchievements';
import { useReview } from '@/hooks/useReview';
import { MessageBubble } from '@/components/MessageBubble';
import { OptionsList } from '@/components/OptionButton';
import { AffectionBar } from '@/components/AffectionBar';
import { WaitingAnimation } from '@/components/WaitingAnimation';
import { GameOver } from '@/components/GameOver';
import { AchievementPopup } from '@/components/AchievementPopup';
import { ShareCard } from '@/components/ShareCard';
import { ReviewCard } from '@/components/ReviewCard';
import { SCENARIOS, VOICE_TYPES, type Gender, type Option, type GameResult } from '@/lib/types';
import { getAffectionRating, getRoundRating } from '@/lib/types';

export default function GamePage() {
  const router = useRouter();
  const { gameState, isLoading, error, startGame, selectOption, undo, resetGame, canUndo } = useGame();
  const { play, isPlaying, isLoading: isTTSLoading } = useTTS();
  const { unlockedAchievements, checkAchievements } = useAchievements();
  const { review, highlightMessage, isGenerating: isReviewGenerating, generateReview } = useReview();
  
  const [showShareCard, setShowShareCard] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [newAchievement, setNewAchievement] = useState<typeof unlockedAchievements[0] | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUnlockedRef = useRef<string[]>([]);

  // Load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameState?.messages]);

  // 检查游戏是否结束
  useEffect(() => {
    if (!gameState) return;

    const { affection, round, maxRounds, history, options } = gameState;
    const won = affection >= 80;
    const lost = affection <= -50 || round > maxRounds;

    if ((won || lost) && options.length === 0) {
      const result: GameResult = {
        won,
        finalAffection: affection,
        rounds: history.length,
        affectionRating: getAffectionRating(affection),
        roundRating: getRoundRating(history.length),
        achievements: [],
        review: '',
        highlightMessage: null,
      };
      setGameResult(result);
      checkAchievements(history, won, affection, 0, 0);
      generateReview(history, gameState.messages);
    }
  }, [gameState?.options]);

  // 监听新成就解锁
  useEffect(() => {
    const currentUnlocked = unlockedAchievements.map(a => a.id);
    const newOnes = currentUnlocked.filter(id => !lastUnlockedRef.current.includes(id));
    
    if (newOnes.length > 0) {
      const latest = unlockedAchievements.find(a => a.id === newOnes[newOnes.length - 1]);
      if (latest) {
        setNewAchievement(latest);
      }
    }
    
    lastUnlockedRef.current = currentUnlocked;
  }, [unlockedAchievements]);

  // 播放语音
  const handlePlayAudio = async (text: string) => {
    if (!gameState) return;
    await play(text, gameState.voiceType.speakerId);
  };

  // 处理选项选择
  const handleSelectOption = async (option: Option) => {
    await selectOption(option);
  };

  // 处理重试
  const handleRetry = () => {
    setGameResult(null);
    setShowShareCard(false);
    resetGame();
  };

  // 处理分享
  const handleShare = () => {
    setShowShareCard(true);
  };

  // 游戏开始页面
  if (!gameState) {
    return <StartScreen onStart={startGame} isLoading={isLoading} error={error} currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 分享卡片页面
  if (showShareCard && gameResult) {
    return (
      <div className="min-h-screen bg-[var(--macaron-bg)] flex items-center justify-center p-4">
        <div className="max-w-sm mx-auto">
          <ShareCard 
            result={{ ...gameResult, achievements: unlockedAchievements }}
            highlightMessage={highlightMessage}
            scenarioName={gameState.scenario.name}
          />
          <button
            onClick={() => setShowShareCard(false)}
            className="w-full mt-4 py-3 bg-white text-[var(--macaron-text)] rounded-2xl font-medium shadow-lg active:scale-95 transition-transform"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 游戏结束页面
  if (gameResult) {
    return (
      <div className="min-h-screen bg-[var(--macaron-bg)]">
        {newAchievement && (
          <AchievementPopup 
            achievement={newAchievement} 
            onClose={() => setNewAchievement(null)} 
          />
        )}
        
        <div className="max-w-lg mx-auto p-4">
          <GameOver 
            result={{ ...gameResult, achievements: unlockedAchievements }}
            achievements={unlockedAchievements}
            onRetry={handleRetry}
            onShare={handleShare}
            currentUser={currentUser}
            scenario={gameState.scenario.name}
          />
          
          <div className="mt-4">
            <ReviewCard review={review || '正在生成复盘...'} isLoading={isReviewGenerating} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--macaron-bg)] flex flex-col">
      {/* 顶部导航栏 - 马卡龙风格 */}
      <div className="bg-gradient-to-r from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] text-[var(--macaron-text)] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={resetGame} className="p-1 active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-[#FFD700]">💕 哄哄模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <button onClick={() => router.push('/profile')} className="text-xs bg-white/60 px-2 py-1 rounded-full active:scale-90 transition-transform">{currentUser.username}</button>
          )}
          {canUndo && (
            <button 
              onClick={undo}
              className="text-sm bg-white/60 px-3 py-1 rounded-full active:scale-90 transition-all"
            >
              撤回
            </button>
          )}
        </div>
      </div>

      {/* 好感度状态条 - 马卡龙风格，固定在导航栏下方 */}
      <div className="h-[18vh] min-h-[140px] bg-white border-b-2 border-[var(--macaron-pink)]/20 flex flex-col justify-center px-4 sticky top-[52px] z-20 shadow-sm">
        <AffectionBar 
          affection={gameState.affection}
          maxRounds={gameState.maxRounds}
          currentRound={gameState.round}
        />
      </div>

      {/* 消息区域 - 马卡龙背景 */}
      <div className="flex-1 overflow-auto bg-[var(--macaron-bg)] p-4 space-y-4">
        {/* 装饰元素 */}
        <div className="absolute top-40 left-2 w-8 h-8 bg-[var(--macaron-mint)]/30 rounded-full" />
        <div className="absolute top-60 right-4 w-6 h-6 bg-[var(--macaron-lavender)]/30 rounded-full" />
        
        {gameState.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            gender={gameState.gender}
            onAudioClick={() => handlePlayAudio(message.content)}
            isPlaying={isPlaying}
            isLoadingAudio={isTTSLoading}
            autoPlay={true}
          />
        ))}
        
        {gameState.isWaiting && gameState.waitType && (
          <WaitingAnimation type={gameState.waitType} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 选项区域 - 马卡龙风格 */}
      {!gameState.isWaiting && gameState.options.length > 0 && (
        <div className="bg-gradient-to-t from-white to-[var(--macaron-mint-light)]/50 border-t-2 border-[var(--macaron-mint)]/30 p-4 safe-area-bottom">
          <OptionsList
            options={gameState.options}
            onSelect={handleSelectOption}
            disabled={gameState.isWaiting}
          />
        </div>
      )}
    </div>
  );
}

// 开始页面组件 - 马卡龙清新风
function StartScreen({ 
  onStart, 
  isLoading, 
  error,
  currentUser,
  onLogout
}: { 
  onStart: (gender: Gender, scenarioId: string, voiceTypeId: string) => void;
  isLoading: boolean;
  error: string | null;
  currentUser: { id: number; username: string } | null;
  onLogout: () => void;
}) {
  const [step, setStep] = useState<'gender' | 'scenario' | 'voice'>('gender');
  const [gender, setGender] = useState<Gender | null>(null);
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [voiceTypeId, setVoiceTypeId] = useState<string>('');
  const router = useRouter();

  // 处理开始游戏
  const handleStart = () => {
    if (gender && voiceTypeId) {
      onStart(gender, scenarioId, voiceTypeId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--macaron-pink-light)] via-[var(--macaron-bg)] to-[var(--macaron-mint-light)] flex flex-col items-center justify-center p-6">
      {/* 装饰圆形 */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[var(--macaron-pink)]/20 rounded-full blur-2xl" />
      <div className="absolute top-40 right-16 w-16 h-16 bg-[var(--macaron-mint)]/30 rounded-full blur-xl" />
      <div className="absolute bottom-32 left-20 w-24 h-24 bg-[var(--macaron-lavender)]/30 rounded-full blur-2xl" />
      <div className="absolute bottom-40 right-10 w-14 h-14 bg-[var(--macaron-yellow)]/30 rounded-full blur-xl" />

      {/* 标题 - 马卡龙风格 */}
      <div className="text-center mb-6 animate-bounce-slow">
        <div className="text-6xl mb-4">💕</div>
        <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
          哄哄模拟器
        </h1>
        <p className="text-[var(--macaron-text-light)] text-sm">
          10轮内把Ta哄好，算你赢！
        </p>
      </div>

      {/* 恋爱攻略 + 排行榜入口 */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push('/blog')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-sm rounded-full shadow-md border border-[var(--macaron-pink)]/20 text-[var(--macaron-text)] font-bold text-sm hover:shadow-lg active:scale-95 transition-all"
        >
          <span>📖</span>
          <span>恋爱攻略</span>
        </button>
        <button
          onClick={() => router.push('/leaderboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-sm rounded-full shadow-md border border-[var(--macaron-gold)]/30 text-[var(--macaron-text)] font-bold text-sm hover:shadow-lg active:scale-95 transition-all"
        >
          <span>🏆</span>
          <span>排行榜</span>
        </button>
      </div>

      {/* 用户信息 / 登录注册入口 - 右上角 */}
      <div className="absolute top-5 right-5 z-10">
        {currentUser ? (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-[var(--macaron-lavender)]/30">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-base">👤</span>
              <span className="font-bold text-[var(--macaron-text)] text-sm">{currentUser.username}</span>
            </button>
            <span className="w-px h-4 bg-[var(--macaron-lavender)]/30" />
            <button
              onClick={onLogout}
              className="text-xs text-[var(--macaron-text-light)] hover:text-[var(--macaron-pink)] transition-colors font-medium"
            >
              退出
            </button>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#07C160] text-white rounded-full shadow-md font-bold text-sm hover:bg-[#06AD56] hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-xs">💕</span>
              <span>登录</span>
            </button>
            <button
              onClick={() => router.push('/register')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-[var(--macaron-mint)]/40 text-[var(--macaron-text)] font-bold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-xs">✨</span>
              <span>注册</span>
            </button>
          </div>
        )}
      </div>

      {/* 步骤1：选择性别 */}
      {step === 'gender' && (
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[var(--macaron-pink)]/20 animate-fadeIn">
          <h2 className="text-lg font-bold text-[var(--macaron-text)] mb-6 text-center">
            选择你要哄的对象 🎀
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setGender('girlfriend');
                setStep('scenario');
              }}
              className="py-6 px-4 bg-gradient-to-br from-[var(--macaron-pink-light)] to-[var(--macaron-pink)] rounded-2xl text-[var(--macaron-text)] font-bold shadow-lg active:scale-95 transition-all hover:shadow-xl"
            >
              <span className="text-4xl block mb-2">😊</span>
              <span className="text-sm">女朋友</span>
            </button>
            <button
              onClick={() => {
                setGender('boyfriend');
                setStep('scenario');
              }}
              className="py-6 px-4 bg-gradient-to-br from-[var(--macaron-mint-light)] to-[var(--macaron-mint)] rounded-2xl text-[var(--macaron-text)] font-bold shadow-lg active:scale-95 transition-all hover:shadow-xl"
            >
              <span className="text-4xl block mb-2">😎</span>
              <span className="text-sm">男朋友</span>
            </button>
          </div>
        </div>
      )}

      {/* 步骤2：选择场景 */}
      {step === 'scenario' && (
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-[var(--macaron-mint)]/20 animate-fadeIn">
          <h2 className="text-lg font-bold text-[var(--macaron-text)] mb-6 text-center">
            发生了什么？ 🌸
          </h2>
          <div className="space-y-3">
            {SCENARIOS.map((scenario, index) => (
              <button
                key={scenario.id}
                onClick={() => setScenarioId(scenario.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98] ${
                  scenarioId === scenario.id
                    ? 'bg-gradient-to-r from-[var(--macaron-pink-light)] to-[var(--macaron-lavender)] border-2 border-[var(--macaron-pink)] shadow-md'
                    : 'bg-white/60 border-2 border-transparent hover:bg-white/80'
                }`}
              >
                <p className="font-bold text-[var(--macaron-text)]">{scenario.name}</p>
                <p className="text-sm text-[var(--macaron-text-light)] mt-1">{scenario.description}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('gender')}
              className="flex-1 py-3 bg-white/60 text-[var(--macaron-text)] rounded-2xl font-bold hover:bg-white/80 active:scale-95 transition-all"
            >
              上一步
            </button>
            <button
              onClick={() => {
                const defaultVoice = VOICE_TYPES.find(v => v.gender === gender);
                setVoiceTypeId(defaultVoice?.id || VOICE_TYPES[0].id);
                setStep('voice');
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              下一步 ✨
            </button>
          </div>
        </div>
      )}

      {/* 步骤3：选择声音 */}
      {step === 'voice' && gender && (
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-[var(--macaron-lavender)]/20 animate-fadeIn">
          <h2 className="text-lg font-bold text-[var(--macaron-text)] mb-6 text-center">
            选择声音 🎵
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {VOICE_TYPES.filter(v => v.gender === gender).map((voice) => (
              <button
                key={voice.id}
                onClick={() => setVoiceTypeId(voice.id)}
                className={`p-4 rounded-2xl text-left transition-all active:scale-[0.98] flex items-center justify-between ${
                  voiceTypeId === voice.id
                    ? 'bg-gradient-to-r from-[var(--macaron-mint-light)] to-[var(--macaron-mint)] border-2 border-[var(--macaron-mint)] shadow-md'
                    : 'bg-white/60 border-2 border-transparent hover:bg-white/80'
                }`}
              >
                <p className="font-bold text-[var(--macaron-text)]">{voice.name}</p>
                <span
                  onClick={async (e) => {
                    e.stopPropagation();
                    const sampleText = voice.gender === 'girlfriend' ? '哼，你还有脸来找我？' : '宝贝，我错了还不行嘛';
                    try {
                      const res = await fetch('/api/tts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: sampleText, speakerId: voice.speakerId, uid: `preview_${voice.id}` }),
                      });
                      const data = await res.json();
                      if (data.audioUri) {
                        const audio = new Audio(data.audioUri);
                        audio.play().catch(() => {});
                      }
                    } catch {}
                  }}
                  className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--macaron-pink)]/20 hover:bg-[var(--macaron-pink)]/40 transition-colors text-sm cursor-pointer"
                  title="试听"
                >
                  ▶
                </span>
              </button>
            ))}
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center mt-4">{error}</p>
          )}
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep('scenario')}
              className="flex-1 py-3 bg-white/60 text-[var(--macaron-text)] rounded-2xl font-bold hover:bg-white/80 active:scale-95 transition-all"
            >
              上一步
            </button>
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-[var(--macaron-pink)] to-[var(--macaron-lavender)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '加载中...' : '开始游戏 🎮'}
            </button>
          </div>
        </div>
      )}

      {/* 底部装饰 */}
      <div className="mt-10 flex gap-3">
        <div className="w-3 h-3 bg-[var(--macaron-pink)] rounded-full animate-pulse" />
        <div className="w-3 h-3 bg-[var(--macaron-mint)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-3 h-3 bg-[var(--macaron-lavender)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}
