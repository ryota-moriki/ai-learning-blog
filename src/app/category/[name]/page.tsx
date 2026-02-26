import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostsByCategory, getPaginatedPosts } from '@/lib/posts';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { Pagination } from '@/components/ui/Pagination';
import Link from 'next/link';
import type { Category } from '@/types/post';

const VALID_CATEGORIES: Category[] = ['雑学', '技術', '実用'];

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((cat) => ({ name: encodeURIComponent(cat) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const category = decodeURIComponent(name);
  return {
    title: `${category} カテゴリ`,
    description: `${category} カテゴリの記事一覧`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { page: pageParam } = await searchParams;
  const category = decodeURIComponent(name) as Category;

  if (!VALID_CATEGORIES.includes(category)) notFound();

  const page = Math.max(1, parseInt(pageParam ?? '1', 10));
  const allPosts = getPostsByCategory(category);
  const { posts, totalPages } = getPaginatedPosts(page, allPosts);

  const basePath = `/category/${encodeURIComponent(category)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-gray-900">ホーム</Link>
          <span>›</span>
          <span>カテゴリ</span>
          <span>›</span>
          <span className="text-gray-900">{category}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {category}
        </h1>
        <p className="text-gray-500 text-sm">{allPosts.length} 記事</p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link
          href="/"
          className="px-4 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
        >
          すべて
        </Link>
        {VALID_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/category/${encodeURIComponent(cat)}`}
            className={[
              'px-4 py-1.5 text-sm rounded-full border font-medium transition-colors',
              cat === category
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900',
            ].join(' ')}
          >
            {cat}
          </Link>
        ))}
      </div>

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p>このカテゴリにはまだ記事がありません</p>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}
