'use client';

import { useEffect, useState, use } from 'react';
import { PostEditor } from '@/components/admin/PostEditor';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function AdminEditPostPage({ params }: Props) {
  const { slug } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postData, setPostData] = useState<{
    title: string;
    description: string;
    slug: string;
    category: string;
    tags: string[];
    published: boolean;
    content: string;
  } | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/admin/posts/${slug}`);
        if (!res.ok) {
          setError('記事が見つかりません');
          return;
        }
        const data = await res.json();
        setPostData({
          title: data.frontmatter.title || '',
          description: data.frontmatter.description || '',
          slug: data.frontmatter.slug || slug,
          category: data.frontmatter.category || '技術',
          tags: data.frontmatter.tags || [],
          published: data.frontmatter.published ?? false,
          content: data.content || '',
        });
      } catch {
        setError('記事の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (error || !postData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'エラーが発生しました'}</p>
          <a href="/admin" className="text-blue-600 hover:underline text-sm">
            管理画面に戻る
          </a>
        </div>
      </div>
    );
  }

  return <PostEditor mode="edit" initialData={postData} />;
}
