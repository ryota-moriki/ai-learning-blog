import Link from 'next/link';
import type { PostMeta } from '@/types/post';
import { CategoryBadge } from './CategoryBadge';
import { TagBadge } from './TagBadge';

interface Props {
  post: PostMeta;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ArticleCard({ post }: Props) {
  return (
    <article className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <CategoryBadge category={post.category} asLink />
        <time className="text-sm text-gray-500" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
        <span className="text-sm text-gray-400">· {post.readingTime}分で読める</span>
      </div>

      <h2 className="text-xl font-bold mb-2">
        <Link
          href={`/posts/${post.slug}`}
          className="text-gray-900 hover:text-blue-600 transition-colors"
        >
          {post.title}
        </Link>
      </h2>

      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
        {post.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <Link
          href={`/posts/${post.slug}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
        >
          続きを読む →
        </Link>
      </div>
    </article>
  );
}
