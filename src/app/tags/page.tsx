import type { Metadata } from 'next';
import { getAllTags } from '@/lib/posts';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'タグ一覧',
  description: 'Learning Blog のタグ一覧',
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-gray-900">ホーム</Link>
          <span>›</span>
          <span className="text-gray-900">タグ一覧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">タグ一覧</h1>
        <p className="text-gray-500 text-sm">{tags.length} タグ</p>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <span>#{tag}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>まだタグがありません</p>
        </div>
      )}
    </div>
  );
}
