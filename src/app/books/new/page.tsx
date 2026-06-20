'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { booksApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import type { BookRequest } from '@/types';

const FIELDS: { name: keyof BookRequest; label: string; placeholder: string }[] = [
  { name: 'title', label: '제목', placeholder: '도서 제목을 입력하세요' },
  { name: 'author', label: '저자', placeholder: '저자명을 입력하세요' },
  { name: 'publisher', label: '출판사', placeholder: '출판사명을 입력하세요' },
  { name: 'isbn', label: 'ISBN', placeholder: 'ISBN을 입력하세요' },
];

export default function NewBookPage() {
  const router = useRouter();
  const [form, setForm] = useState<BookRequest>({ title: '', author: '', publisher: '', isbn: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin()) router.replace('/books');
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await booksApi.create(form);
      router.push('/books');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '도서 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link href="/books" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        ← 도서 목록
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">도서 등록</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {FIELDS.map(({ name, label, placeholder }) => (
            <div key={name} className="flex flex-col gap-1">
              <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type="text"
                required
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 mt-2">
            <Link
              href="/books"
              className="flex-1 py-2 text-center rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
