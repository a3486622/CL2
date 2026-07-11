# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 项目概述

**哄哄模拟器** - 一个情侣吵架后的哄人练习游戏。AI扮演正在生气的对象，用户通过选择题的方式回应，在10轮内把对方哄好。

### 核心功能

- 5个预设场景（忘记纪念日、深夜不回消息、被发现和异性聊天、把猫弄丢了、当众没面子）
- 动态LLM生成对话和选项
- 好感度系统（初始20分，目标80分）
- 成就系统（13种成就 + 隐藏成就）
- 复盘系统（损友+暖心风格）
- 分享卡片生成
- TTS语音播放

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── game/route.ts    # 游戏主API（LLM对话）
│   │   │   ├── review/route.ts  # 复盘API
│   │   │   └── tts/route.ts     # 语音合成API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # 主游戏页面
│   ├── components/
│   │   ├── AffectionBar.tsx    # 好感度进度条
│   │   ├── AchievementPopup.tsx # 成就弹出
│   │   ├── Avatar.tsx          # 情绪头像
│   │   ├── GameOver.tsx        # 游戏结束
│   │   ├── MessageBubble.tsx   # 消息气泡
│   │   ├── OptionButton.tsx    # 选项按钮
│   │   ├── ReviewCard.tsx      # 复盘卡片
│   │   ├── ShareCard.tsx       # 分享卡片
│   │   └── WaitingAnimation.tsx # 等待动画
│   ├── hooks/
│   │   ├── useAchievements.ts  # 成就系统
│   │   ├── useGame.ts          # 游戏状态管理
│   │   ├── useReview.ts        # 复盘逻辑
│   │   └── useTTS.ts           # 语音播放
│   └── lib/
│       └── types.ts            # 类型定义和常量
├── SPEC.md                     # 产品规格说明书
├── next.config.ts
├── package.json
└── tsconfig.json
```

## API 接口

### POST /api/game
游戏主接口，支持 start 和 continue 两种操作。

### POST /api/tts
语音合成接口，使用 coze-coding-dev-sdk 的 TTSClient。

### POST /api/review
复盘生成接口，使用 LLM 分析对话历史。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器。
- 安装依赖：`pnpm add <package>`
- 开发依赖：`pnpm add -D <package>`
- 构建：`pnpm build`
- 开发：`pnpm dev`

## 开发规范

### 编码规范

- TypeScript strict 模式
- 禁止隐式 any
- 组件使用 'use client'
- 动态内容使用 useEffect + useState

### 集成服务

- **LLM**: 使用 coze-coding-dev-sdk 的 LLMClient，支持流式输出
- **TTS**: 使用 coze-coding-dev-sdk 的 TTSClient

## 技能使用

- LLM集成：`/skills/public/prod/llm`
- TTS集成：`/skills/public/prod/audio`
