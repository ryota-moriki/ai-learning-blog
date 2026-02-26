import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import {
  getFileFromGitHub,
  createOrUpdateFile,
  deleteFileFromGitHub,
} from '@/lib/github';

const POSTS_PATH = 'content/posts';

async function findPostFile(
  slug: string
): Promise<{ content: string; sha: string; path: string } | null> {
  // .mdx を先に検索、なければ .md
  const mdxPath = `${POSTS_PATH}/${slug}.mdx`;
  const mdxFile = await getFileFromGitHub(mdxPath);
  if (mdxFile) return { ...mdxFile, path: mdxPath };

  const mdPath = `${POSTS_PATH}/${slug}.md`;
  const mdFile = await getFileFromGitHub(mdPath);
  if (mdFile) return { ...mdFile, path: mdPath };

  return null;
}

// GET: 記事詳細（編集用）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const file = await findPostFile(slug);

  if (!file) {
    return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
  }

  const { data, content } = matter(file.content);

  return NextResponse.json({
    frontmatter: data,
    content,
  });
}

// PUT: 記事更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { title, description, category, tags, published, content, newSlug } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { status: 400 }
      );
    }

    const file = await findPostFile(slug);
    if (!file) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    // 既存の frontmatter を読み込んで更新
    const { data: existingData } = matter(file.content);
    const now = new Date().toISOString().split('T')[0];
    const finalSlug = newSlug || slug;

    const frontmatter = {
      ...existingData,
      title,
      description: description || '',
      slug: finalSlug,
      updated: now,
      category: category || existingData.category || '技術',
      tags: tags || existingData.tags || [],
      published: published ?? existingData.published ?? false,
    };

    const fileContent = matter.stringify(content, frontmatter);

    // slug が変更された場合
    if (newSlug && newSlug !== slug) {
      const newPath = `${POSTS_PATH}/${newSlug}.mdx`;
      const existingNew = await getFileFromGitHub(newPath);
      if (existingNew) {
        return NextResponse.json(
          { error: '新しいslugの記事が既に存在します' },
          { status: 409 }
        );
      }

      // 新しいファイルを作成
      const createResult = await createOrUpdateFile(
        newPath,
        fileContent,
        `Rename post: ${slug} → ${newSlug}`
      );
      if (!createResult.success) {
        return NextResponse.json(
          { error: `GitHub API エラー: ${createResult.error}` },
          { status: 500 }
        );
      }

      // 古いファイルを削除
      await deleteFileFromGitHub(file.path, file.sha, `Delete old post: ${slug}`);
    } else {
      // 同じパスで更新
      const result = await createOrUpdateFile(
        file.path,
        fileContent,
        `Update post: ${title}`,
        file.sha
      );
      if (!result.success) {
        return NextResponse.json(
          { error: `GitHub API エラー: ${result.error}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      slug: finalSlug,
      message: '記事を更新しました。デプロイ後に反映されます。',
    });
  } catch (err) {
    console.error('Post update error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `サーバーエラー: ${message}` }, { status: 500 });
  }
}

// DELETE: 記事削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const file = await findPostFile(slug);

    if (!file) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    const result = await deleteFileFromGitHub(
      file.path,
      file.sha,
      `Delete post: ${slug}`
    );

    if (!result.success) {
      return NextResponse.json(
        { error: `GitHub API エラー: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '記事を削除しました。デプロイ後に反映されます。',
    });
  } catch (err) {
    console.error('Post delete error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `サーバーエラー: ${message}` }, { status: 500 });
  }
}
