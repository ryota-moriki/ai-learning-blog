import type { Metadata } from 'next';
import { getPostsByTag, getAllTags, getPaginatedPosts } from '@/lib/posts';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';

interface Props {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `#${decoded} タグの記事一覧`,
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const decoded = decodeURIComponent(tag);

  const page = Math.max(1, parseInt(pageParam ?? '1', 10));
  const allPosts = getPostsByTag(decoded);
  const { posts, totalPages } = getPaginatedPosts(page, allPosts);

  const basePath = `/tags/${encodeURIComponent(decoded)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-gray-900">ホーム</Link>
          <span>›</span>
          <Link href="/tags" className="hover:text-gray-900">タグ一覧</Link>
          <span>›</span>
          <span className="text-gray-900">#{decoded}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">#{decoded}</h1>
        <p className="text-gray-500 text-sm">{allPosts.length} 記事</p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>このタグの記事はありません</p>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}
