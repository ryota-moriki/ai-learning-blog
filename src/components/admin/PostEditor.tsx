'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CATEGORIES = ['雑学', '技術', '実用'] as const;

interface PostData {
  title: string;
  description: string;
  slug: string;
  category: string;
  tags: string[];
  published: boolean;
  content: string;
}

interface Props {
  initialData?: PostData;
  mode: 'new' | 'edit';
}

function generateSlug(title: string): string {
  // 日本語（マルチバイト文字）が含まれる場合は自動生成しない
  if (/[^\x00-\x7F]/.test(title)) {
    return '';
  }
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

export function PostEditor({ initialData, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(', ') ?? '');

  const [form, setForm] = useState<PostData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    slug: initialData?.slug ?? '',
    category: initialData?.category ?? '技術',
    tags: initialData?.tags ?? [],
    published: initialData?.published ?? false,
    content: initialData?.content ?? '',
  });

  function updateField<K extends keyof PostData>(key: K, value: PostData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    updateField('title', title);
    // 新規作成時のみ slug を自動生成
    if (mode === 'new') {
      updateField('slug', generateSlug(title));
    }
  }

  function handleTagsChange(input: string) {
    setTagsInput(input);
    const tags = input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateField('tags', tags);
  }

  async function handleSave() {
    setError('');
    setSuccessMessage('');

    if (!form.title.trim()) {
      setError('タイトルは必須です');
      return;
    }
    if (!form.slug.trim()) {
      setError('Slugは必須です。英数字とハイフンでURLに使う名前を入力してください（例: how-ai-works）');
      return;
    }
    if (!/^[a-z0-9_-]+$/i.test(form.slug)) {
      setError('Slugは英数字・ハイフン・アンダースコアのみ使用できます');
      return;
    }
    if (!form.content.trim()) {
      setError('本文は必須です');
      return;
    }

    setSaving(true);

    try {
      const url =
        mode === 'new'
          ? '/api/admin/posts'
          : `/api/admin/posts/${initialData?.slug}`;

      const method = mode === 'new' ? 'POST' : 'PUT';
      const body: Record<string, unknown> = { ...form };
      if (mode === 'edit' && form.slug !== initialData?.slug) {
        body.newSlug = form.slug;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '保存に失敗しました');
        return;
      }

      setSuccessMessage('✅ 保存しました！Vercelが自動デプロイ中です（1〜2分で反映されます）');
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 3000);
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← 管理画面に戻る
            </button>
            <h1 className="font-bold text-gray-900">
              {mode === 'new' ? '新規作成' : '記事を編集'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => updateField('published', e.target.checked)}
                className="rounded border-gray-300"
              />
              公開
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            {successMessage}
          </div>
        )}

        {/* Metadata form */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="記事のタイトル"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">概要</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="記事の概要（OGP用）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="url-friendly-slug"
              />
              <p className="text-xs text-gray-400 mt-1">
                URL: /posts/{form.slug || '...'} ※英数字とハイフンで入力（例: how-ai-works）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Next.js, React, TypeScript（カンマ区切り）"
              />
            </div>
          </div>
        </div>

        {/* Editor / Preview toggle */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 text-sm rounded ${
              !showPreview ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            エディタ
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 text-sm rounded ${
              showPreview ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            プレビュー
          </button>
        </div>

        {/* Editor area */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
          {showPreview ? (
            <div className="p-6 prose prose-gray max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>
                {form.content || '*プレビューする内容がありません*'}
              </Markdown>
            </div>
          ) : (
            <textarea
              value={form.content}
              onChange={(e) => updateField('content', e.target.value)}
              className="w-full h-full min-h-[500px] p-4 text-sm font-mono resize-y focus:outline-none"
              placeholder="Markdown で記事を書く..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
