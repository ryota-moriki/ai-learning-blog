import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import Image from 'next/image';

export const mdxComponents: MDXComponents = {
  // Anchor links in headings
  a: ({ href, children, ...props }) => {
    if (href?.startsWith('/') || href?.startsWith('#')) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },

  // Responsive images
  img: ({ src, alt, width, height, ...props }) => {
    if (!src) return null;
    return (
      <span className="block my-6">
        <Image
          src={src}
          alt={alt ?? ''}
          width={Number(width) || 800}
          height={Number(height) || 450}
          className="rounded-lg mx-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
          {...props}
        />
        {alt && <span className="block text-center text-sm text-gray-500 mt-1">{alt}</span>}
      </span>
    );
  },

  // Callout / Note blocks via blockquote
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-blue-400 bg-blue-50 pl-4 py-2 my-4 text-blue-900 rounded-r"
      {...props}
    >
      {children}
    </blockquote>
  ),
};
