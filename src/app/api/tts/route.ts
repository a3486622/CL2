import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 简单的并发控制：同一时间只允许一个TTS请求
let isProcessing = false;
const pendingQueue: Array<() => void> = [];

async function acquireLock(): Promise<void> {
  if (!isProcessing) {
    isProcessing = true;
    return;
  }
  return new Promise<void>((resolve) => {
    pendingQueue.push(resolve);
  });
}

function releaseLock(): void {
  if (pendingQueue.length > 0) {
    const next = pendingQueue.shift();
    next?.();
  } else {
    isProcessing = false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, speakerId, uid } = body;

    if (!text || !speakerId) {
      return NextResponse.json({ error: 'Missing text or speakerId' }, { status: 400 });
    }

    // 等待获取锁
    await acquireLock();

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 重试逻辑：遇到并发限制时等待后重试
    let lastError: unknown = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await client.synthesize({
          uid: uid || `user_${Date.now()}`,
          text,
          speaker: speakerId,
          audioFormat: 'mp3',
          sampleRate: 24000,
        });

        releaseLock();

        return NextResponse.json({
          audioUri: response.audioUri,
          audioSize: response.audioSize,
        });
      } catch (err: unknown) {
        lastError = err;
        const errMessage = err instanceof Error ? err.message : String(err);
        
        // 并发限制错误，等待后重试
        if (errMessage.includes('concurrency') || errMessage.includes('quota')) {
          const delay = (attempt + 1) * 2000; // 2s, 4s, 6s
          console.warn(`TTS concurrency limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // 非并发错误，直接抛出
        break;
      }
    }

    releaseLock();
    throw lastError;
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: '语音合成失败，请稍后再试' }, { status: 500 });
  }
}
