import Link from 'next/link';

interface Props {
  tag: string;
  asLink?: boolean;
}

export function TagBadge({ tag, asLink = true }: Props) {
  const className =
    'inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors';

  if (asLink) {
    return (
      <Link href={`/tags/${encodeURIComponent(tag)}`} className={className}>
        #{tag}
      </Link>
    );
  }

  return <span className={className}>#{tag}</span>;
}
