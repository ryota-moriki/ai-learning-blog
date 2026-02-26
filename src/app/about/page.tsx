import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About',
  description: 'このブログについて',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-gray-900">ホーム</Link>
          <span>›</span>
          <span className="text-gray-900">About</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">About</h1>
      </div>

      <div className="prose prose-gray max-w-none">
        <h2>このブログについて</h2>
        <p>
          勉強したこと・やってみたことを記事にまとめた学習記録ブログです。
          アウトプット駆動学習を通じて知識を整理し、同じ課題を持つ方への情報共有を目的としています。
        </p>

        <h2>カテゴリ</h2>
        <ul>
          <li><strong>雑学</strong> — 日常で調べたこと、トリビア</li>
          <li><strong>技術</strong> — プログラミング、ツールの使い方、技術検証</li>
          <li><strong>実用</strong> — ライフハック、仕事効率化、便利ツール紹介</li>
        </ul>

        <h2>技術スタック</h2>
        <ul>
          <li>Next.js (App Router)</li>
          <li>TypeScript</li>
          <li>Tailwind CSS v4</li>
          <li>Markdown / MDX</li>
          <li>Shiki (シンタックスハイライト)</li>
        </ul>
      </div>
    </div>
  );
}
