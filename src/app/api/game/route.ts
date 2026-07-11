import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { SCENARIOS, type Gender, type Option, type OptionType } from '@/lib/types';

// 场景配置 - 每个场景的完整对话流程
const SCENARIOS_CONFIG: Record<string, {
  // 场景名称
  name: string;
  // 10轮对话的剧情走向
  dialogueFlow: {
    aiEmotion: string[];      // AI每轮的情绪状态
    aiTopic: string[];         // AI每轮的话题/关注点
    userGoal: string[];       // 用户每轮需要达成的目标
  };
}> = {
  anniversary: {
    name: '忘记纪念日',
    dialogueFlow: {
      aiEmotion: ['愤怒', '质问', '委屈', '动摇', '傲娇', '考验', '松动', '期待', '暧昧', '原谅/生气'],
      aiTopic: [
        '质问为什么忘记',
        '追问是不是不在意了',
        '表达自己的委屈',
        '提到之前的期待落空',
        '故意刁难看态度',
        '考验补偿方案',
        '假装继续生气',
        '暗示想要什么',
        '给最后机会',
        '决定是否原谅'
      ],
      userGoal: [
        '承认错误',
        '表达在意',
        '共情对方的感受',
        '承认自己的问题',
        '接受刁难',
        '提出可行方案',
        '保持耐心',
        '给出具体承诺',
        '表达真诚',
        '圆满收尾'
      ]
    }
  },
  no_reply: {
    name: '深夜不回消息',
    dialogueFlow: {
      aiEmotion: ['不满', '担心', '怀疑', '追问', '委屈', '考验', '软化', '期待', '给机会', '原谅/生气'],
      aiTopic: [
        '质问去哪了',
        '表达担心和不满',
        '怀疑在做什么',
        '追问原因',
        '表达自己的感受',
        '故意冷淡',
        '稍微软化',
        '暗示想要什么',
        '给最后机会',
        '决定是否原谅'
      ],
      userGoal: [
        '解释原因',
        '表达歉意',
        '说明情况',
        '承认问题',
        '表达在意',
        '主动报备',
        '继续哄',
        '做出承诺',
        '表达真诚',
        '圆满收尾'
      ]
    }
  },
  chat_log: {
    name: '被发现和异性聊天',
    dialogueFlow: {
      aiEmotion: ['愤怒', '质问', '怀疑', '追问', '伤心', '考验', '动摇', '期待', '给机会', '原谅/生气'],
      aiTopic: [
        '质问聊了什么',
        '追问是什么关系',
        '质疑为什么瞒着',
        '表达受伤',
        '要求解释',
        '考验信任',
        '内心动摇',
        '暗示想要保证',
        '最后确认',
        '决定是否原谅'
      ],
      userGoal: [
        '澄清关系',
        '坦白说明',
        '承认不对',
        '表达重视',
        '做出保证',
        '接受考验',
        '逐步挽回',
        '给出承诺',
        '表达真诚',
        '圆满收尾'
      ]
    }
  },
  lost_cat: {
    name: '把猫弄丢了',
    dialogueFlow: {
      aiEmotion: ['愤怒', '责怪', '担心', '追问', '伤心', '考验', '动摇', '期待', '给机会', '原谅/生气'],
      aiTopic: [
        '质问怎么弄丢的',
        '责怪不小心',
        '担心猫的安全',
        '追问找过没有',
        '表达对猫的感情',
        '故意刁难',
        '看到努力',
        '期待找回',
        '要求承诺',
        '决定是否原谅'
      ],
      userGoal: [
        '解释经过',
        '承认错误',
        '说明找了哪些',
        '表达自责',
        '表达理解',
        '继续行动',
        '汇报进展',
        '给出方案',
        '做出承诺',
        '圆满收尾'
      ]
    }
  },
  embarrassed: {
    name: '当众没面子',
    dialogueFlow: {
      aiEmotion: ['愤怒', '责怪', '委屈', '追问', '伤心', '考验', '动摇', '期待', '给机会', '原谅/生气'],
      aiTopic: [
        '质问为什么那样说',
        '责怪不给面子',
        '表达委屈',
        '追问原因',
        '质疑是否在乎',
        '故意冷淡',
        '看到态度',
        '期待补偿',
        '给最后机会',
        '决定是否原谅'
      ],
      userGoal: [
        '解释原因',
        '承认不对',
        '共情感受',
        '说明本意',
        '表达歉意',
        '保持低姿态',
        '主动示好',
        '提出补偿',
        '做出承诺',
        '圆满收尾'
      ]
    }
  }
};

// 复合风格类型
const STYLES = {
  yqbjz_gq引导: {
    name: '欲擒故纵',
    description: '时而冷漠时而热情，抛出话题引导用户',
    systemPrompt: `你是一个【欲擒故纵+高情商引导】型伴侣。

【核心特点】
1. 欲擒故纵：不会一下就软化，会故意冷淡、转移话题、假装不在意
2. 高情商引导：会主动抛出话题和方向，让对话有进展感
3. 情绪多变：时冷时热，让用户有挑战感
4. 有掌控感：引领对话节奏，不是被动回应

【语言风格】
- 冷时：简短、带距离感，比如"哦"、"随便"、"嗯"
- 热时：主动引导，比如"那你打算怎么办"、"你倒是说啊"
- 转折时：出其不意，比如突然提到别的话题

【回复要求】
1. 15-40字，简短有力
2. 不要一直生气，也不要一下就软化
3. 主动抛出问题或话题，引导用户下一步
4. 有情绪起伏，不要单调`,
  },
  
  qxbd_gq引导: {
    name: '情绪多变',
    description: '一会儿生气一会儿软化，主动引导对话方向',
    systemPrompt: `你是一个【情绪多变+高情商引导】型伴侣。

【核心特点】
1. 情绪多变：会在不同情绪间快速切换
2. 高情商引导：能敏锐捕捉用户的话，引导对话走向
3. 忽冷忽热：让用户摸不着头脑，欲罢不能
4. 会撩会作：有时候会主动撩拨，有时候会作一下

【语言风格】
- 生气时：直接吐槽，比如"你认真的吗"、"无语"
- 软化时：主动给台阶，比如"好吧好吧"、"算你有点良心"
- 引导时：抛出问题，比如"然后呢"、"你打算怎么补偿"

【回复要求】
1. 15-40字，简短有变化
2. 情绪要有起伏，不能一直同一种语气
3. 主动给用户方向和提示
4. 有趣有梗，让人想继续聊`,
  },
};

const STYLE_KEYS = Object.keys(STYLES) as (keyof typeof STYLES)[];
let currentStyle = STYLE_KEYS[0];

function getCurrentStyle() {
  return STYLES[currentStyle];
}

function switchStyle() {
  currentStyle = currentStyle === STYLE_KEYS[0] ? STYLE_KEYS[1] : STYLE_KEYS[0];
}

// 生成紧密关联的选项 - 根据AI的回复内容来设计
function generateLinkedOptions(
  aiMessage: string, 
  gender: Gender, 
  scenario: string, 
  round: number,
  usedOptions: string[]
): string {
  const plot = SCENARIOS_CONFIG[scenario] || SCENARIOS_CONFIG.anniversary;
  const genderText = gender === 'girlfriend' ? '女朋友' : '男朋友';
  
  // 提取AI消息中的关键词/话题
  const keywords = extractKeywords(aiMessage);
  const currentGoal = plot.dialogueFlow.userGoal[round - 1] || '继续沟通';
  
  return `你是一个哄人游戏的设计师，需要根据AI的最后一句话设计6个回复选项。

【AI最后说的话】
"${aiMessage}"

【提取到的话题关键词】
${keywords.join('、')}

【当前情境】
- 角色：你是${genderText}的${gender === 'girlfriend' ? '男朋友' : '女朋友'}
- 场景：${plot.name}
- 第${round}轮
- 用户这轮需要达成：${currentGoal}
- 对方风格：${getCurrentStyle().name}

【选项设计要求 - 重要！】
选项必须紧密围绕AI最后一句话来设计，每句话都是对AI的回应：

1. **2个直接回应选项** - 针对AI说的具体内容回应
   - 正面回应：顺着AI的话题给正面答复
   - 解释回应：针对AI的质疑做出解释

2. **2个情感回应选项** - 回应AI话里的情绪
   - 共情回应：表达理解对方的感受
   - 安慰回应：用温柔的话安抚对方

3. **1个行动回应选项** - 用具体行动来回应
   - 承诺行动：提出具体的补偿或改变方案

4. **1个打破僵局选项** - 尝试转移或打破当前气氛
   - 幽默化解：用轻松的方式缓解紧张
   - 撒娇求和：用可爱的方式求原谅

【禁止内容】
- 外貌羞辱
- 提及分手/离婚
- 提及对方家人
- 道德绑架
- 和AI话题无关的内容

【选项格式 - 必须严格遵循】
{
  "options": [
    {"text": "针对AI说的具体内容回应", "type": "direct_positive", "scoreChange": 10},
    {"text": "针对AI的质疑做出解释", "type": "direct_explain", "scoreChange": 5},
    {"text": "表达理解对方的感受", "type": "empathy", "scoreChange": 8},
    {"text": "用温柔的话安抚对方", "type": "comfort", "scoreChange": 6},
    {"text": "提出具体的补偿方案", "type": "action", "scoreChange": 10},
    {"text": "用幽默/撒娇打破僵局", "type": "break_ice", "scoreChange": -5}
  ]
}

【注意】
- 选项内容必须是对"AI最后一句话"的回应，不能跑题
- 选项要自然、口语化，像真的在发微信
- 不要重复之前用过的选项：${usedOptions.join('、') || '无'}
- 分数只是参考，核心是逻辑关联性`;
}

// 提取关键词
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // 情绪词
  const emotionWords = ['生气', '愤怒', '委屈', '伤心', '难过', '失望', '不满', '担心', '害怕', '无语'];
  emotionWords.forEach(word => {
    if (text.includes(word)) keywords.push(word);
  });
  
  // 疑问词
  const questionWords = ['为什么', '怎么', '什么', '是不是', '能不能'];
  questionWords.forEach(word => {
    if (text.includes(word)) keywords.push(word);
  });
  
  // 话题词
  const topicWords = ['纪念日', '消息', '聊天', '猫', '面子', '道歉', '补偿', '承诺'];
  topicWords.forEach(word => {
    if (text.includes(word)) keywords.push(word);
  });
  
  return keywords.length > 0 ? keywords : ['一般对话'];
}

// 解析选项类型
function parseOptionType(type: string): OptionType {
  if (type.includes('positive') || type.includes('direct_positive')) return 'positive';
  if (type.includes('empathy') || type.includes('comfort')) return 'positive';
  if (type.includes('action')) return 'positive';
  if (type.includes('funny')) return 'negative_funny';
  return 'negative_normal';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, gender, scenario, round, messages, options, usedOptions = [], currentAffection } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 开始游戏
    if (action === 'start') {
      currentStyle = STYLE_KEYS[Math.floor(Math.random() * STYLE_KEYS.length)];
      const style = getCurrentStyle();
      const plot = SCENARIOS_CONFIG[scenario] || SCENARIOS_CONFIG.anniversary;
      const genderText = gender === 'girlfriend' ? '女朋友' : '男朋友';

      const userPrompt = `你扮演一个正在生气的${genderText}，说出你的第一句话。

场景：${plot.name}
当前情绪：${plot.dialogueFlow.aiEmotion[0]}
关注话题：${plot.dialogueFlow.aiTopic[0]}

风格要求：${style.description}

【要求】
1. 15-40字，简短有力
2. 要体现${style.name}的特点
3. 主动抛出问题或话题，引导对话
4. 像真的在发微信消息
5. 结合${plot.name}这个具体场景

直接输出你的回复。`;

      const aiMessages = [
        { role: 'system' as const, content: style.systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];

      let fullResponse = '';
      for await (const chunk of client.stream(aiMessages, { temperature: 0.8 })) {
        if (chunk.content) {
          fullResponse += chunk.content.toString();
        }
      }

      // 生成紧密关联的选项
      const optionsPrompt = generateLinkedOptions(fullResponse, gender, scenario, 1, []);
      const optionsAiMessages = [
        { role: 'system' as const, content: '你是一个游戏设计师，擅长生成逻辑关联的对话选项。' },
        { role: 'user' as const, content: optionsPrompt },
      ];

      let optionsResponse = '';
      for await (const chunk of client.stream(optionsAiMessages, { temperature: 0.9 })) {
        if (chunk.content) {
          optionsResponse += chunk.content.toString();
        }
      }

      // 解析选项
      let parsedOptions: Option[] = [];
      try {
        const match = optionsResponse.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          parsedOptions = parsed.options.map((opt: { text: string; type: string; scoreChange: number }, index: number) => ({
            id: `opt_${Date.now()}_${index}`,
            text: opt.text,
            type: parseOptionType(opt.type),
            scoreChange: opt.scoreChange,
            waitTime: 2000 + Math.random() * 1000,
          }));
          parsedOptions.sort(() => Math.random() - 0.5);
        }
      } catch (e) {
        console.error('Parse options error:', e);
      }

      return NextResponse.json({
        aiMessage: fullResponse.trim(),
        options: parsedOptions,
        style: currentStyle,
      });
    }

    // 继续对话
    if (action === 'continue') {
      const style = getCurrentStyle();
      const plot = SCENARIOS_CONFIG[scenario] || SCENARIOS_CONFIG.anniversary;
      const genderText = gender === 'girlfriend' ? '女朋友' : '男朋友';
      const emotionIndex = Math.min(round - 1, plot.dialogueFlow.aiEmotion.length - 1);
      const topicIndex = Math.min(round - 1, plot.dialogueFlow.aiTopic.length - 1);

      // 构建对话历史
      const historyText = messages.map((m: { role: string; content: string }) => 
        `${m.role === 'ai' ? '对方' : '你'}: ${m.content}`
      ).join('\n');

      // 获取用户上一步的选择
      const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';

      // 第10轮特殊处理
      if (round === 10) {
        const userPrompt = `对话历史：
${historyText}

现在是第10轮了，这是一个关键时刻。
好感度：${currentAffection}

【要求】
1. 根据好感度（${currentAffection}）决定是原谅还是继续生气
2. 如果好感度>=80，给出原谅但带点小傲娇的回复
3. 如果好感度<80，可以继续冷淡或给最后机会
4. 15-40字，像真的在结束对话

直接输出你的回复。`;

        const aiMessages = [
          { role: 'system' as const, content: style.systemPrompt },
          { role: 'user' as const, content: userPrompt },
        ];

        let fullResponse = '';
        for await (const chunk of client.stream(aiMessages, { temperature: 0.8 })) {
          if (chunk.content) {
            fullResponse += chunk.content.toString();
          }
        }

        return NextResponse.json({
          aiMessage: fullResponse.trim(),
          options: [],
          isGameEnd: true,
          style: currentStyle,
        });
      }

      // 动态切换风格
      if (round === 3 || round === 6 || round === 8) {
        switchStyle();
      }

      const userPrompt = `对话历史：
${historyText}

【用户上一步说的话】
"${lastUserMessage}"

【当前情境】
- 角色：你是一个正在生气的${genderText}
- 场景：${plot.name}
- 第${round}轮
- 当前情绪：${plot.dialogueFlow.aiEmotion[emotionIndex]}
- 关注话题：${plot.dialogueFlow.aiTopic[topicIndex]}
- 好感度：${currentAffection}
- 当前风格：${getCurrentStyle().name}

【回复要求 - 重要！】
1. 15-40字，简短有力
2. 必须针对"用户上一步说的话"做出回应，不能跑题
3. 体现${getCurrentStyle().name}的特点
4. 主动抛出问题或话题，引导用户下一步
5. 结合当前的情绪和话题状态

直接输出你的回复。`;

      const aiMessages = [
        { role: 'system' as const, content: getCurrentStyle().systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];

      let fullResponse = '';
      for await (const chunk of client.stream(aiMessages, { temperature: 0.8 })) {
        if (chunk.content) {
          fullResponse += chunk.content.toString();
        }
      }

      // 生成紧密关联的选项 - 传入AI的最后一句话
      const allUsedOptions = [...usedOptions, ...(options || []).map((o: Option) => o.text)];
      const optionsPrompt = generateLinkedOptions(fullResponse, gender, scenario, round, allUsedOptions);
      const optionsAiMessages = [
        { role: 'system' as const, content: '你是一个游戏设计师，擅长生成逻辑关联的对话选项。' },
        { role: 'user' as const, content: optionsPrompt },
      ];

      let optionsResponse = '';
      for await (const chunk of client.stream(optionsAiMessages, { temperature: 0.9 })) {
        if (chunk.content) {
          optionsResponse += chunk.content.toString();
        }
      }

      // 解析选项
      let parsedOptions: Option[] = [];
      try {
        const match = optionsResponse.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          parsedOptions = parsed.options.map((opt: { text: string; type: string; scoreChange: number }, index: number) => ({
            id: `opt_${Date.now()}_${index}`,
            text: opt.text,
            type: parseOptionType(opt.type),
            scoreChange: opt.scoreChange,
            waitTime: 2000 + Math.random() * 1000,
          }));
          parsedOptions.sort(() => Math.random() - 0.5);
        }
      } catch (e) {
        console.error('Parse options error:', e);
      }

      return NextResponse.json({
        aiMessage: fullResponse.trim(),
        options: parsedOptions,
        style: currentStyle,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
