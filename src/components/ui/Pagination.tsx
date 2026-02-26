import Link from 'next/link';

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

function pageHref(basePath: string, page: number): string {
  const base = basePath.includes('?') ? basePath : basePath;
  const sep = basePath.includes('?') ? '&' : '?';
  return page === 1 ? basePath : `${base}${sep}page=${page}`;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-center gap-1 mt-8">
      {currentPage > 1 && (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          className="px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
        >
          ← 前へ
        </Link>
      )}

      {showPages.map((page, idx) => {
        const prev = showPages[idx - 1];
        const showEllipsis = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-2 py-2 text-sm text-gray-400">…</span>
            )}
            {page === currentPage ? (
              <span className="px-3 py-2 text-sm border border-blue-500 rounded bg-blue-500 text-white font-medium">
                {page}
              </span>
            ) : (
              <Link
                href={pageHref(basePath, page)}
                className="px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
              >
                {page}
              </Link>
            )}
          </span>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          className="px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
        >
          次へ →
        </Link>
      )}
    </nav>
  );
}
