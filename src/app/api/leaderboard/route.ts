import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET: 排行榜 - 按最高好感度分数排名前20
export async function GET() {
  try {
    const client = getSupabaseClient();

    // 查询所有游戏记录
    const { data: records, error: recordsError } = await client
      .from('game_records')
      .select('user_id, final_score, played_at')
      .order('final_score', { ascending: false });

    if (recordsError) throw new Error(`查询排行榜失败: ${recordsError.message}`);

    if (!records || records.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // 获取所有涉及的用户ID
    const userIds = [...new Set(records.map((r: { user_id: number }) => r.user_id))];

    // 查询用户名
    const { data: users, error: usersError } = await client
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (usersError) throw new Error(`查询用户信息失败: ${usersError.message}`);

    // 用户ID到用户名映射
    const userMap = new Map<number, string>();
    for (const u of (users || [])) {
      userMap.set(u.id, u.username);
    }

    // 按用户分组，取每个用户的最高分
    const userBestMap = new Map<number, { userId: number; username: string; bestScore: number; achievedAt: string }>();

    for (const record of records) {
      const userId = record.user_id;
      const username = userMap.get(userId) || '未知用户';
      const existing = userBestMap.get(userId);

      if (!existing || record.final_score > existing.bestScore) {
        userBestMap.set(userId, {
          userId,
          username,
          bestScore: record.final_score,
          achievedAt: record.played_at,
        });
      }
    }

    // 转为数组排序，取前20
    const leaderboard = Array.from(userBestMap.values())
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        userId: item.userId,
        username: item.username,
        bestScore: item.bestScore,
        achievedAt: item.achievedAt,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: '查询排行榜失败' }, { status: 500 });
  }
}
