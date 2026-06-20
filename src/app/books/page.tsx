'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { booksApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import type { Book, BookStatus, PageResponse } from '@/types';

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

function StatusBadge({ status }: { status: BookStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function BooksPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(false);

  const [inputKeyword, setInputKeyword] = useState('');
  const [inputSearchType, setInputSearchType] = useState('all');

  const [filters, setFilters] = useState({ keyword: '', searchType: 'all', page: 0 });
  const [data, setData] = useState<PageResponse<Book> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      page: filters.page,
      size: 9,
      ...(filters.keyword ? { keyword: filters.keyword, searchType: filters.searchType } : {}),
    };
    booksApi
      .getAll(params)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [filters]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters({ keyword: inputKeyword, searchType: inputSearchType, page: 0 });
  }

  function changePage(next: number) {
    setFilters((f) => ({ ...f, page: next }));
  }

  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.number ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">도서 목록</h1>
        {admin && (
          <Link
            href="/books/new"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + 도서 등록
          </Link>
        )}
      </div>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <select
          value={inputSearchType}
          onChange={(e) => setInputSearchType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="author">저자</option>
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {inputKeyword && (
            <button
              type="button"
              onClick={() => {
                setInputKeyword('');
                setInputSearchType('all');
                setFilters((f) => ({ ...f, keyword: '', searchType: 'all', page: 0 }));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors"
        >
          검색
        </button>
      </form>

      {/* 도서 목록 */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 font-medium">
                <th className="px-5 py-3">제목</th>
                <th className="px-5 py-3">저자</th>
                <th className="px-5 py-3">출판사</th>
                <th className="px-5 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((book) => (
                <tr
                  key={book.id}
                  onClick={() => router.push(`/books/${book.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-gray-900">{book.title}</td>
                  <td className="px-5 py-4 text-gray-600">{book.author}</td>
                  <td className="px-5 py-4 text-gray-500">{book.publisher}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={book.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
