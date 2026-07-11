import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = Number(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ error: '无效的文章ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, content, emoji, tag, created_at')
      .eq('id', articleId)
      .maybeSingle();

    if (error) throw new Error(`查询文章失败: ${error.message}`);

    if (!data) {
      return NextResponse.json({ error: '文章未找到' }, { status: 404 });
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error('Blog detail API error:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}
