import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const GENERATE_PROMPT = `你是一个恋爱专栏作家，风格轻松幽默，擅长用生活化的语言写恋爱沟通技巧文章。

请写一篇关于恋爱沟通技巧的文章，主题可以从以下方向中选择一个（不要重复已有主题）：
- 如何正确表达不满
- 冷暴力比吵架更可怕
- 会说话的人恋爱都不会太差
- 情侣间的高效沟通法则
- 当对方说"没事"的时候
- 如何优雅地翻篇
- 吵架时哪些话绝对不能说
- 怎样让对方觉得你真的在听
- 谈恋爱也要讲基本法
- 感情里的"假性沟通"

要求：
1. 风格轻松幽默，像朋友聊天一样
2. 300-500字
3. 内容要实用，给出具体建议
4. 可以用一些有趣的小比喻
5. 不要用markdown格式，直接纯文本
6. 分3-4个自然段

请按以下格式输出（严格遵守）：
【标题】你的文章标题
【emoji】一个emoji
【标签】2-4个字的标签
【正文】你的文章正文内容`;

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    // 调用LLM生成文章
    let fullResponse = '';
    for await (const chunk of llmClient.stream(
      [
        { role: 'system' as const, content: '你是一个恋爱专栏作家，风格轻松幽默，擅长用生活化的语言写恋爱攻略。请严格按指定格式输出。' },
        { role: 'user' as const, content: GENERATE_PROMPT },
      ],
      { temperature: 0.9 }
    )) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    // 解析LLM输出
    const titleMatch = fullResponse.match(/【标题】(.+?)(?:\n|【)/);
    const emojiMatch = fullResponse.match(/【emoji】(.+?)(?:\n|【)/);
    const tagMatch = fullResponse.match(/【标签】(.+?)(?:\n|【)/);
    const contentMatch = fullResponse.match(/【正文】([\s\S]+)$/);

    const title = titleMatch?.[1]?.trim() || '恋爱沟通小技巧';
    const emoji = emojiMatch?.[1]?.trim() || '💕';
    const tag = tagMatch?.[1]?.trim() || '沟通技巧';
    const content = contentMatch?.[1]?.trim() || fullResponse.trim();

    // 从内容中提取摘要
    const summary = content.slice(0, 60) + '...';

    // 保存到数据库
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert({ title, summary, content, emoji, tag })
      .select('id, title, summary, content, emoji, tag, created_at')
      .single();

    if (error) throw new Error(`保存文章失败: ${error.message}`);

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error('Generate article error:', error);
    return NextResponse.json({ error: '生成文章失败' }, { status: 500 });
  }
}
