import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

function findPostFile(slug: string): string | null {
  const mdxPath = path.join(POSTS_DIR, `${slug}.mdx`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(mdxPath)) return mdxPath;
  if (fs.existsSync(mdPath)) return mdPath;
  return null;
}

// GET: 記事詳細（編集用）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = findPostFile(slug);

  if (!filePath) {
    return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

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

    const filePath = findPostFile(slug);
    if (!filePath) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    // 既存の frontmatter を読み込んで更新
    const existing = fs.readFileSync(filePath, 'utf-8');
    const { data: existingData } = matter(existing);

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

    // slug が変更された場合、古いファイルを削除して新しいファイルを作成
    if (newSlug && newSlug !== slug) {
      const newPath = path.join(POSTS_DIR, `${newSlug}.mdx`);
      if (fs.existsSync(newPath)) {
        return NextResponse.json(
          { error: '新しいslugの記事が既に存在します' },
          { status: 409 }
        );
      }
      fs.writeFileSync(newPath, fileContent, 'utf-8');
      fs.unlinkSync(filePath);
    } else {
      fs.writeFileSync(filePath, fileContent, 'utf-8');
    }

    return NextResponse.json({ success: true, slug: finalSlug });
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// DELETE: 記事削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = findPostFile(slug);

    if (!filePath) {
      return NextResponse.json({ error: '記事が見つかりません' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
