'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import type { AdminLoan, LoanStatus, PageResponse } from '@/types';

const STATUS_LABEL: Record<LoanStatus, string> = {
  ACTIVE: '대출 중',
  RETURNED: '반납 완료',
  OVERDUE: '연체',
};

const STATUS_COLOR: Record<LoanStatus, string> = {
  ACTIVE: 'bg-blue-100 text-blue-700',
  RETURNED: 'bg-gray-100 text-gray-500',
  OVERDUE: 'bg-red-100 text-red-700',
};

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: '전체', value: '' },
  { label: '대출 중', value: 'ACTIVE' },
  { label: '반납 완료', value: 'RETURNED' },
  { label: '연체', value: 'OVERDUE' },
];

function fmt(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function AdminLoansPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AdminLoan> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/books');
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    adminApi
      .getLoans(page, 10, statusFilter || undefined)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [authorized, page, statusFilter]);

  function changeFilter(value: string) {
    setStatusFilter(value);
    setPage(0);
  }

  if (!authorized) return null;

  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">전체 대출 현황</h1>

      <div className="flex gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => changeFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">대출 내역이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 font-medium">
                <th className="px-5 py-3">회원명</th>
                <th className="px-5 py-3">도서명</th>
                <th className="px-5 py-3">대출일</th>
                <th className="px-5 py-3">반납예정일</th>
                <th className="px-5 py-3">반납일</th>
                <th className="px-5 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-700">{loan.username}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{loan.bookTitle}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(loan.loanDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(loan.dueDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(loan.returnDate)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[loan.status]}`}
                    >
                      {STATUS_LABEL[loan.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
