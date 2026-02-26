import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import { getAllPostSlugs, getPostBySlug, getAllPostsMeta, extractHeadings } from '@/lib/posts';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { TagBadge } from '@/components/ui/TagBadge';
import { TableOfContents } from '@/components/mdx/TableOfContents';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { mdxComponents } from '@/components/mdx/MDXComponents';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const rehypePrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.published) notFound();

  const headings = extractHeadings(post.content);

  // Related posts: same category, exclude current
  const relatedPosts = getAllPostsMeta()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Article header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={post.category} asLink />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.updated && post.updated !== post.date && (
            <>
              <span>·</span>
              <span>更新: {formatDate(post.updated)}</span>
            </>
          )}
          <span>·</span>
          <span>{post.readingTime}分で読める</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </header>

      {/* Table of contents */}
      <TableOfContents headings={headings} />

      {/* Article body */}
      <article className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 prose-code:before:content-none prose-code:after:content-none">
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                [rehypePrettyCode, rehypePrettyCodeOptions],
              ],
            },
          }}
        />
      </article>

      {/* SNS share buttons */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">この記事をシェアする</p>
        <div className="flex gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`/posts/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            X (Twitter)
          </a>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">関連記事</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
