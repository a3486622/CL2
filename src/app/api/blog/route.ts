import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface BlogArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  emoji: string | null;
  tag: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 从数据库读取所有文章
    const { data, error } = await client
      .from('blog_posts')
      .select('id, title, summary, content, emoji, tag, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`查询文章失败: ${error.message}`);

    return NextResponse.json({ articles: data as BlogArticle[] });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}
