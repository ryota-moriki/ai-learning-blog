import Link from 'next/link';
import type { Category } from '@/types/post';

const categoryStyles: Record<Category, string> = {
  '雑学': 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  '技術': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  '実用': 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
};

interface Props {
  category: Category;
  asLink?: boolean;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, asLink = false, size = 'md' }: Props) {
  const className = [
    'inline-flex items-center font-medium border rounded',
    size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5',
    categoryStyles[category],
  ].join(' ');

  if (asLink) {
    return (
      <Link href={`/category/${encodeURIComponent(category)}`} className={className}>
        {category}
      </Link>
    );
  }

  return <span className={className}>{category}</span>;
}
