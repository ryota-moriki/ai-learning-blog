'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = ['雑学', '技術', '実用'] as const;

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const navLinkClass = (href: string) =>
    [
      'text-sm font-medium transition-colors',
      isActive(href) ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
            📝 AI学習ノート
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={navLinkClass('/')}>
              ホーム
            </Link>
            <div className="relative group">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                カテゴリ
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${encodeURIComponent(cat)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/tags" className={navLinkClass('/tags')}>
              タグ
            </Link>
            <Link href="/about" className={navLinkClass('/about')}>
              About
            </Link>
            <Link
              href="/search"
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="検索"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <Link href="/" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
              ホーム
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${encodeURIComponent(cat)}`}
                className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}
            <Link href="/tags" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
              タグ
            </Link>
            <Link href="/about" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link href="/search" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
              検索
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
