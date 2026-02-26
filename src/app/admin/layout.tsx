import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理画面 | AI学習ノート',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
