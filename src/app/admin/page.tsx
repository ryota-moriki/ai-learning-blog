'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostItem {
  title: string;
  slug: string;
  date: string;
  category: string;
  published: boolean;
  fileName: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const res = await fetch('/api/admin/posts');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts);
    } catch {
      // 認証エラーは middleware がリダイレクトする
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？\nこの操作は取り消せません。`)) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
      }
    } catch {
      alert('削除に失敗しました');
    } finally {
      setDeleting(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
              ← サイトに戻る
            </Link>
            <h1 className="font-bold text-gray-900">管理画面</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            記事一覧 {!loading && <span className="text-sm font-normal text-gray-500">({posts.length}件)</span>}
          </h2>
          <Link
            href="/admin/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新規作成
          </Link>
        </div>

        {/* Posts table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>まだ記事がありません</p>
            <Link href="/admin/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              最初の記事を作成する →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">カテゴリ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">日付</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.slug} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/edit/${post.slug}`}
                        className="text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {post.title || '（無題）'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{post.category}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{post.date}</td>
                    <td className="px-4 py-3">
                      {post.published ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          公開
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          下書き
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/edit/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          編集
                        </Link>
                        {post.published && (
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="text-gray-400 hover:text-gray-700 text-xs"
                          >
                            表示
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(post.slug, post.title)}
                          disabled={deleting === post.slug}
                          className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
                        >
                          {deleting === post.slug ? '削除中...' : '削除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
