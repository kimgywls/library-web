'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { booksApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import type { BookRequest } from '@/types';

const FIELDS: { name: keyof BookRequest; label: string; placeholder: string }[] = [
  { name: 'title', label: '제목', placeholder: '도서 제목을 입력하세요' },
  { name: 'author', label: '저자', placeholder: '저자명을 입력하세요' },
  { name: 'publisher', label: '출판사', placeholder: '출판사명을 입력하세요' },
  { name: 'isbn', label: 'ISBN', placeholder: 'ISBN을 입력하세요' },
];

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<BookRequest>({ title: '', author: '', publisher: '', isbn: '' });
  const [dataLoading, setDataLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/books');
      return;
    }
    booksApi
      .getOne(Number(id))
      .then((book) => {
        setForm({ title: book.title, author: book.author, publisher: book.publisher, isbn: book.isbn });
      })
      .catch(() => router.replace('/books'))
      .finally(() => setDataLoading(false));
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      await booksApi.update(Number(id), form);
      router.push(`/books/${id}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '도서 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  }

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={`/books/${id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← 도서 상세
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">도서 수정</h1>

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
              href={`/books/${id}`}
              className="flex-1 py-2 text-center rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitLoading ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
