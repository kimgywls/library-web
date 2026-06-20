'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { booksApi, loansApi, reservationsApi } from '@/lib/api';
import { isAdmin, isLoggedIn } from '@/lib/auth';
import type { Book, BookStatus } from '@/types';

const STATUS_LABEL: Record<BookStatus, string> = {
  AVAILABLE: '대출 가능',
  LOANED: '대출 중',
  RESERVED: '예약 중',
};

const STATUS_COLOR: Record<BookStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  LOANED: 'bg-red-100 text-red-700',
  RESERVED: 'bg-yellow-100 text-yellow-700',
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [alreadyLoaned, setAlreadyLoaned] = useState(false);
  const [alreadyReserved, setAlreadyReserved] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setAdmin(isAdmin());
  }, []);

  function fetchBook() {
    setLoading(true);
    booksApi
      .getOne(Number(id))
      .then(setBook)
      .catch(() => router.replace('/books'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!loggedIn || !book) return;
    Promise.all([loansApi.getMine(), reservationsApi.getMine()])
      .then(([loans, reservations]) => {
        setAlreadyLoaned(loans.some((l) => l.bookId === book.id && (l.status === 'ACTIVE' || l.status === 'OVERDUE')));
        setAlreadyReserved(reservations.some((r) => r.bookId === book.id && r.status === 'WAITING'));
      })
      .catch(() => {});
  }, [loggedIn, book]);

  async function handleLoan() {
    if (!book) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await loansApi.loan(book.id);
      setSuccess('대출 신청이 완료되었습니다.');
      setAlreadyLoaned(true);
      fetchBook();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '대출 신청 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReserve() {
    if (!book) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await reservationsApi.reserve(book.id);
      setSuccess('예약이 완료되었습니다.');
      setAlreadyReserved(true);
      fetchBook();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '예약 신청 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!book || !confirm(`"${book.title}" 도서를 삭제하시겠습니까?`)) return;
    try {
      await booksApi.delete(book.id);
      router.push('/books');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '삭제 중 오류가 발생했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
    );
  }

  if (!book) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/books" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        ← 도서 목록
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">{book.title}</h1>
          <span className={`shrink-0 px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLOR[book.status]}`}>
            {STATUS_LABEL[book.status]}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-8">
          {[
            { label: '저자', value: book.author },
            { label: '출판사', value: book.publisher },
            { label: 'ISBN', value: book.isbn },
            { label: '등록일', value: new Date(book.createdAt).toLocaleDateString('ko-KR') },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-gray-400 font-medium mb-0.5">{label}</dt>
              <dd className="text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>

        {success && <p className="text-sm text-green-600 mb-4">{success}</p>}
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="flex flex-wrap gap-3">
          {loggedIn ? (
            <>
              {book.status === 'AVAILABLE' && (
                <button
                  onClick={handleLoan}
                  disabled={actionLoading || alreadyLoaned}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? '처리 중...' : alreadyLoaned ? '이미 대출 중' : '대출 신청'}
                </button>
              )}
              {book.status === 'LOANED' && (
                <button
                  onClick={handleReserve}
                  disabled={actionLoading || alreadyLoaned || alreadyReserved}
                  className="px-5 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? '처리 중...' : alreadyLoaned ? '이미 대출 중' : alreadyReserved ? '이미 예약 중' : '예약 신청'}
                </button>
              )}
              {book.status === 'RESERVED' && (
                <span className="px-5 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">
                  예약 대기 중
                </span>
              )}
              {admin && (
                <>
                  <Link
                    href={`/books/edit/${book.id}`}
                    className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    삭제
                  </button>
                </>
              )}
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              로그인 후 이용 가능합니다
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
