import { getAllPostsMeta, getPaginatedPosts } from '@/lib/posts';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';

const CATEGORIES = ['雑学', '技術', '実用'] as const;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const allPosts = getAllPostsMeta();
  const { posts, totalPages } = getPaginatedPosts(page, allPosts);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">記事一覧</h1>
        <p className="text-gray-500 text-sm">全 {allPosts.length} 記事</p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link
          href="/"
          className="px-4 py-1.5 text-sm rounded-full border border-blue-500 bg-blue-500 text-white font-medium"
        >
          すべて
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/category/${encodeURIComponent(cat)}`}
            className="px-4 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Article list */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>まだ記事がありません</p>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath="/" />
    </div>
  );
}
