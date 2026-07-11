import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

// POST: 保存游戏记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scenario, finalScore, result } = body;

    if (!userId || !scenario || finalScore === undefined || !result) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (!['通关', '失败'].includes(result)) {
      return NextResponse.json({ error: 'result只能是通关或失败' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('game_records')
      .insert({
        user_id: userId,
        scenario,
        final_score: finalScore,
        result,
      })
      .select('id, user_id, scenario, final_score, result, played_at')
      .single();

    if (error) throw new Error(`保存游戏记录失败: ${error.message}`);

    return NextResponse.json({ record: data as GameRecord });
  } catch (error) {
    console.error('Game records POST error:', error);
    return NextResponse.json({ error: '保存游戏记录失败' }, { status: 500 });
  }
}

// GET: 查询用户游戏记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少userId参数' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('game_records')
      .select('id, user_id, scenario, final_score, result, played_at')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (error) throw new Error(`查询游戏记录失败: ${error.message}`);

    return NextResponse.json({ records: data as GameRecord[] });
  } catch (error) {
    console.error('Game records GET error:', error);
    return NextResponse.json({ error: '查询游戏记录失败' }, { status: 500 });
  }
}
