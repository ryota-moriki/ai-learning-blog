import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Category } from '@/types/post';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

function ensurePostsDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

// GET: 全記事一覧（下書き含む）
export async function GET() {
  ensurePostsDir();

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  interface AdminPostItem {
    title: string;
    slug: string;
    date: string;
    category: string;
    published: boolean;
    fileName: string;
    [key: string]: unknown;
  }

  const posts: AdminPostItem[] = files.map((file) => {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);
    return {
      title: (data.title as string) || '',
      slug: (data.slug as string) || file.replace(/\.(mdx|md)$/, ''),
      date: (data.date as string) || '',
      category: (data.category as string) || '',
      published: (data.published as boolean) ?? false,
      fileName: file,
    };
  });

  // 日付降順
  posts.sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  return NextResponse.json({ posts });
}

// POST: 記事作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, slug, category, tags, published, content } = body;

    // バリデーション
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'タイトル、slug、本文は必須です' },
        { status: 400 }
      );
    }

    // slug のバリデーション（英数字・ハイフン・アンダースコアのみ）
    if (!/^[a-z0-9_-]+$/i.test(slug)) {
      return NextResponse.json(
        { error: 'slugは英数字・ハイフン・アンダースコアのみ使用できます' },
        { status: 400 }
      );
    }

    ensurePostsDir();

    // 既存ファイルチェック
    const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'この slug の記事は既に存在します' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString().split('T')[0];
    const frontmatter = {
      title,
      description: description || '',
      slug,
      date: now,
      category: (category || '技術') as Category,
      tags: tags || [],
      published: published ?? false,
    };

    const fileContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(filePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (err) {
    console.error('Post creation error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `サーバーエラー: ${message}` }, { status: 500 });
  }
}
