import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © {year} AI学習ノート. All rights reserved.
          </div>
          <nav className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">ホーム</Link>
            <Link href="/about" className="hover:text-gray-900 transition-colors">About</Link>
            <Link href="/tags" className="hover:text-gray-900 transition-colors">タグ一覧</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
