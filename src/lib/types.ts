// 预设场景
export interface Scenario {
  id: string;
  name: string;
  description: string;
}

// 选项类型
export type OptionType = 'positive' | 'negative_normal' | 'negative_funny';

// 单个选项
export interface Option {
  id: string;
  text: string;
  type: OptionType;
  scoreChange: number; // 分数变化
  waitTime: number; // 等待时间（毫秒）
}

// 对话消息
export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  audioUrl?: string;
  emotion?: EmotionLevel;
}

// 情绪等级（对应好感度区间）
export type EmotionLevel = 'very_angry' | 'angry' | 'softening' | 'almost_forgiven' | 'forgiven';

// 好感度区间
export type AffectionZone = 
  | 'very_angry'   // -50 ~ 0
  | 'angry'        // 0 ~ 30
  | 'softening'    // 30 ~ 60
  | 'almost_forgiven' // 60 ~ 80
  | 'forgiven';    // 80+

// 性别类型
export type Gender = 'girlfriend' | 'boyfriend';

// 头像选项
export interface AvatarOption {
  id: string;
  name: string;
  url: string;
}

export const AI_AVATARS: Record<Gender, AvatarOption[]> = {
  girlfriend: [
    { id: 'gf_1', name: '小雪', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_4c4d065b-b8a8-4ffd-9ad5-5b994b8a976d.jpeg' },
    { id: 'gf_2', name: '小雅', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_73e261d6-6979-483a-ab0c-af9409b7839a.jpeg' },
    { id: 'gf_3', name: '小琳', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_eee6ac1d-430c-4a43-8cf9-ac6bf3cbf487.jpeg' },
    { id: 'gf_4', name: '小雨', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_8bc5f1c5-b551-4f63-915b-f28ae07ca84e.jpeg' },
    { id: 'gf_5', name: '小薇', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_2270e5d9-ada1-43f5-855e-41acff45b073.jpeg' },
    { id: 'gf_6', name: '小婷', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_2f78c59a-bee7-4857-8d7b-ea236a15aa33.jpeg' },
  ],
  boyfriend: [
    { id: 'bf_1', name: '小杰', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_c5b00f43-6f28-48d4-9643-efc2c2fcf233.jpeg' },
    { id: 'bf_2', name: '小豪', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_69f38a2c-13ba-4ff2-a159-19dc79b06547.jpeg' },
    { id: 'bf_3', name: '小宇', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_38615413-a8d6-473d-aa9c-42886ec94b74.jpeg' },
    { id: 'bf_4', name: '小晨', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_90d0c909-9838-426a-91f1-567c7bc689a0.jpeg' },
    { id: 'bf_5', name: '小阳', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_9364a14d-bebf-447d-801d-7f2e5e9e2bd7.jpeg' },
    { id: 'bf_6', name: '小俊', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_c7a30301-73d8-4696-944e-2089c4ee19f7.jpeg' },
  ],
};

export const USER_AVATARS: AvatarOption[] = [
  { id: 'user_1', name: '头像1', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_40156891-f162-41bb-bd0d-16fd580bb560.jpeg' },
  { id: 'user_2', name: '头像2', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_c2e393b7-1018-48b2-b485-390d19fb783e.jpeg' },
  { id: 'user_3', name: '头像3', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_2f78c59a-bee7-4857-8d7b-ea236a15aa33.jpeg' },
  { id: 'user_4', name: '头像4', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_38615413-a8d6-473d-aa9c-42886ec94b74.jpeg' },
  { id: 'user_5', name: '头像5', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_69f38a2c-13ba-4ff2-a159-19dc79b06547.jpeg' },
  { id: 'user_6', name: '头像6', url: 'https://coze-coding-project.tos.coze.site/coze_storage_7633267930758807604/image/generate_image_4c4d065b-b8a8-4ffd-9ad5-5b994b8a976d.jpeg' },
];

// 声音类型
export interface VoiceType {
  id: string;
  name: string;
  speakerId: string;
  gender: Gender;
}

export const VOICE_TYPES: VoiceType[] = [
  { id: 'gentle_female', name: '温柔女声', speakerId: 'zh_female_xiaohe_uranus_bigtts', gender: 'girlfriend' },
  { id: 'domineering_female', name: '霸道御姐', speakerId: 'zh_female_meilinvyou_saturn_bigtts', gender: 'girlfriend' },
  { id: 'cute_female', name: '可爱软妹', speakerId: 'saturn_zh_female_keainvsheng_tob', gender: 'girlfriend' },
  { id: 'deep_male', name: '低沉男声', speakerId: 'zh_male_m191_uranus_bigtts', gender: 'boyfriend' },
  { id: 'gentle_male', name: '温柔男声', speakerId: 'zh_male_taocheng_uranus_bigtts', gender: 'boyfriend' },
];

// 预设场景列表
export const SCENARIOS: Scenario[] = [
  { id: 'anniversary', name: '忘记纪念日', description: '今天是你们在一起三周年，你完全忘了' },
  { id: 'no_reply', name: '深夜不回消息', description: '你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回' },
  { id: 'chat_log', name: '被发现和异性聊天', description: '对方看到你和异性朋友的暧昧聊天记录' },
  { id: 'lost_cat', name: '把对方的猫弄丢了', description: '你帮对方照顾猫的时候，猫跑丢了' },
  { id: 'embarrassed', name: '当众让对方没面子', description: '你在朋友聚会上开了一个过分的玩笑' },
];

// 游戏状态
export interface GameState {
  gender: Gender;
  scenario: Scenario;
  voiceType: VoiceType;
  aiAvatar?: AvatarOption; // AI头像
  userAvatar?: AvatarOption; // 用户头像
  round: number;
  maxRounds: number;
  affection: number; // 当前好感度
  messages: Message[];
  options: Option[];
  isWaiting: boolean;
  waitType: OptionType | null;
  usedOptions: string[]; // 已使用过的选项ID
  history: RoundHistory[]; // 历史记录（用于回退和复盘）
  personality?: string; // 个性类型
}

// 每轮记录
export interface RoundHistory {
  round: number;
  selectedOption: Option;
  aiMessage: string;
  previousAffection: number;
  newAffection: number;
}

// 成就
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

// 成就定义
export const ACHIEVEMENTS = [
  { id: 'zero_mistake', names: ['嘴甜本甜', '天花乱坠', '社牛附体'], description: '10轮全选加分项', condition: (h: RoundHistory[]) => h.filter(r => r.selectedOption.type === 'positive').length === 10 },
  { id: 'comedy_king', names: ['整活大师', '小丑竟是我自己', '欢乐喜剧人'], description: '选3次以上奇葩选项', condition: (h: RoundHistory[]) => h.filter(r => r.selectedOption.type === 'negative_funny').length >= 3 },
  { id: 'mediocre', names: ['普通市民', '及格型选手', '平庸之才'], description: '选5次以上普通减分项', condition: (h: RoundHistory[]) => h.filter(r => r.selectedOption.type === 'negative_normal').length >= 5 },
  { id: 'emotion_master', names: ['人精本精', '读心术士', '人形灭火器'], description: '5轮内完美通关', condition: (h: RoundHistory[], won: boolean, finalAffection: number) => won && h.length <= 5 && finalAffection >= 96 },
  { id: 'comeback', names: ['逆风翻盘', '绝地求生', '真香定律'], description: '从好感度0以下翻到通关', condition: (h: RoundHistory[], won: boolean) => won && h.some(r => r.previousAffection < 0) },
  { id: 'barely_pass', names: ['险过剃头', '及格万岁', '压线大师'], description: '刚好80分通关', condition: (h: RoundHistory[], won: boolean, finalAffection: number) => won && finalAffection >= 80 && finalAffection <= 84 },
  { id: 'apology_master', names: ['认怂专家', '滑跪大师', '卑微本微'], description: '道歉次数>=7', condition: (h: RoundHistory[]) => h.filter(r => r.selectedOption.text.includes('道歉') || r.selectedOption.text.includes('对不起') || r.selectedOption.text.includes('错了')).length >= 7 },
  { id: 'compensation_master', names: ['画饼大师', '补偿型人格', '承诺大师'], description: '提出弥补方案>=5', condition: (h: RoundHistory[]) => h.filter(r => r.selectedOption.text.includes('补偿') || r.selectedOption.text.includes('弥补') || r.selectedOption.text.includes('下次')).length >= 5 },
  { id: 'excuse_master', names: ['甩锅侠', '借口专家', '嘴硬本硬'], description: '找借口>=5', condition: (h: RoundHistory[]) => h.filter(r => r.selectedOption.type === 'negative_normal' && (r.selectedOption.text.includes('借口') || r.selectedOption.text.includes('但是'))).length >= 5 },
  { id: 'retry_master', names: ['反复横跳', '后悔大师', '选择困难症'], description: '使用回退功能', condition: () => false }, // 通过回退次数判断
  { id: 'explorer', names: ['究极探索者', '选项收集癖', '全试一遍选手'], description: '全部选项都选过', condition: () => false }, // 需要记录
  { id: 'voice_fan', names: ['声优控', '百变怪', '变声器玩家'], description: '切换声音3次+', condition: () => false }, // 通过切换次数判断
];

// 通关评价
export interface GameResult {
  won: boolean;
  finalAffection: number;
  rounds: number;
  affectionRating: 'barely' | 'normal' | 'perfect'; // 80-84, 85-95, 96-100
  roundRating: 'S' | 'A' | 'B'; // 1-5, 6-7, 8-10
  achievements: Achievement[];
  review: string;
  highlightMessage: Message | null;
}

// 情绪等级对应关系
export function getEmotionLevel(affection: number): EmotionLevel {
  if (affection < 0) return 'very_angry';
  if (affection < 30) return 'angry';
  if (affection < 60) return 'softening';
  if (affection < 80) return 'almost_forgiven';
  return 'forgiven';
}

// 等待时间对应
export function getWaitTime(type: OptionType): number {
  switch (type) {
    case 'positive': return 2000;
    case 'negative_normal': return 1000;
    case 'negative_funny': return 3000;
  }
}

// 获取评价
export function getAffectionRating(finalAffection: number): 'barely' | 'normal' | 'perfect' {
  if (finalAffection >= 96) return 'perfect';
  if (finalAffection >= 85) return 'normal';
  return 'barely';
}

export function getRoundRating(rounds: number): 'S' | 'A' | 'B' {
  if (rounds <= 5) return 'S';
  if (rounds <= 7) return 'A';
  return 'B';
}

export function getAffectionRatingText(rating: 'barely' | 'normal' | 'perfect'): string {
  switch (rating) {
    case 'barely': return '险胜过关';
    case 'normal': return '正常通关';
    case 'perfect': return '完美通关';
  }
}

export function getRoundRatingText(rating: 'S' | 'A' | 'B'): string {
  switch (rating) {
    case 'S': return '情商王者';
    case 'A': return '哄人高手';
    case 'B': return '勉强过关';
  }
}
