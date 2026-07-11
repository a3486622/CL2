import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { historyText, prompt } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: '你是一个损友风格的哄人教练，擅长用幽默的方式指出问题并给出建议。' },
      { role: 'user' as const, content: prompt },
    ];

    let fullResponse = '';
    for await (const chunk of client.stream(messages, { temperature: 0.8 })) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    return NextResponse.json({
      review: fullResponse.trim(),
    });
  } catch (error) {
    console.error('Review API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
