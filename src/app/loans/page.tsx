'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loansApi } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import type { Loan, LoanStatus } from '@/types';

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

function fmt(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function LoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningIds, setReturningIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login');
      return;
    }
    fetchLoans();
  }, [router]);

  function fetchLoans() {
    setLoading(true);
    loansApi
      .getMine()
      .then(setLoans)
      .catch(() => setError('대출 목록을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }

  async function handleReturn(loanId: number) {
    setError('');
    setReturningIds((prev) => new Set(prev).add(loanId));
    try {
      await loansApi.returnBook(loanId);
      fetchLoans();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '반납 처리 중 오류가 발생했습니다.');
    } finally {
      setReturningIds((prev) => {
        const next = new Set(prev);
        next.delete(loanId);
        return next;
      });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 대출 목록</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : loans.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">대출 내역이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 font-medium">
                <th className="px-5 py-3">도서명</th>
                <th className="px-5 py-3">저자</th>
                <th className="px-5 py-3">대출일</th>
                <th className="px-5 py-3">반납예정일</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{loan.bookTitle}</td>
                  <td className="px-5 py-4 text-gray-600">{loan.bookAuthor}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(loan.loanDate)}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(loan.dueDate)}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block w-fit px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[loan.status]}`}>
                        {STATUS_LABEL[loan.status]}
                      </span>
                      {loan.overdue && (
                        <span className="text-xs text-red-600 font-medium">연체중</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {loan.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleReturn(loan.id)}
                        disabled={returningIds.has(loan.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {returningIds.has(loan.id) ? '처리 중...' : '반납'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
