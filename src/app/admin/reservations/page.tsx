'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import type { AdminReservation, ReservationStatus, PageResponse } from '@/types';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  WAITING: '대기 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
};

const STATUS_COLOR: Record<ReservationStatus, string> = {
  WAITING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function AdminReservationsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<AdminReservation> | null>(null);
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
      .getReservations(page, 10)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [authorized, page]);

  if (!authorized) return null;

  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">전체 예약 현황</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">예약 내역이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 font-medium">
                <th className="px-5 py-3">회원명</th>
                <th className="px-5 py-3">도서명</th>
                <th className="px-5 py-3">예약일</th>
                <th className="px-5 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-700">{res.username}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{res.bookTitle}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(res.reservedAt)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[res.status]}`}
                    >
                      {STATUS_LABEL[res.status]}
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
