import type { Metadata } from 'next';
import { searchPosts } from '@/lib/posts';
import { ArticleCard } from '@/components/ui/ArticleCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '検索',
  description: '記事を検索する',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = searchPosts(query);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-gray-900">ホーム</Link>
          <span>›</span>
          <span className="text-gray-900">検索</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">記事を検索</h1>

        <form method="get" action="/search">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="タイトル・説明・タグで検索..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              検索
            </button>
          </div>
        </form>
      </div>

      {query ? (
        <>
          <p className="text-sm text-gray-500 mb-4">
            「{query}」の検索結果: {results.length} 件
          </p>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>検索結果が見つかりませんでした</p>
              <p className="text-sm mt-2">別のキーワードで試してみてください</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>キーワードを入力して検索してください</p>
        </div>
      )}
    </div>
  );
}
