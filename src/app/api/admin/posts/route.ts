import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import {
  listFilesFromGitHub,
  getFileFromGitHub,
  createOrUpdateFile,
} from '@/lib/github';

const POSTS_PATH = 'content/posts';

interface AdminPostItem {
  title: string;
  slug: string;
  date: string;
  category: string;
  published: boolean;
  fileName: string;
}

// GET: 全記事一覧（下書き含む）
export async function GET() {
  try {
    const files = await listFilesFromGitHub(POSTS_PATH);

    const posts: AdminPostItem[] = [];

    for (const file of files) {
      const fileData = await getFileFromGitHub(file.path);
      if (!fileData) continue;

      const { data } = matter(fileData.content);
      posts.push({
        title: (data.title as string) || '',
        slug: (data.slug as string) || file.name.replace(/\.(mdx|md)$/, ''),
        date: (data.date as string) || '',
        category: (data.category as string) || '',
        published: (data.published as boolean) ?? false,
        fileName: file.name,
      });
    }

    // 日付降順
    posts.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error('Post list error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `サーバーエラー: ${message}` }, { status: 500 });
  }
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

    // 既存ファイルチェック
    const filePath = `${POSTS_PATH}/${slug}.mdx`;
    const existing = await getFileFromGitHub(filePath);
    if (existing) {
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
      category: category || '技術',
      tags: tags || [],
      published: published ?? false,
    };

    const fileContent = matter.stringify(content, frontmatter);

    const result = await createOrUpdateFile(
      filePath,
      fileContent,
      `Add post: ${title}`
    );

    if (!result.success) {
      return NextResponse.json(
        { error: `GitHub API エラー: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, slug, message: '記事を作成しました。デプロイ後に反映されます。' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Post creation error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `サーバーエラー: ${message}` }, { status: 500 });
  }
}
