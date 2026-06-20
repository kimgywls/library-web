'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reservationsApi } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import type { Reservation, ReservationStatus } from '@/types';

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

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/auth/login');
      return;
    }
    fetchReservations();
  }, [router]);

  function fetchReservations() {
    setLoading(true);
    reservationsApi
      .getMine()
      .then(setReservations)
      .catch(() => setError('예약 목록을 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }

  async function handleCancel(reservationId: number) {
    setError('');
    setCancellingIds((prev) => new Set(prev).add(reservationId));
    try {
      await reservationsApi.cancel(reservationId);
      fetchReservations();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '예약 취소 중 오류가 발생했습니다.');
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(reservationId);
        return next;
      });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 예약 목록</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : reservations.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">예약 내역이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 font-medium">
                <th className="px-5 py-3">도서명</th>
                <th className="px-5 py-3">저자</th>
                <th className="px-5 py-3">예약일</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{res.bookTitle}</td>
                  <td className="px-5 py-4 text-gray-600">{res.bookAuthor}</td>
                  <td className="px-5 py-4 text-gray-600">{fmt(res.reservedAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[res.status]}`}>
                      {STATUS_LABEL[res.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {res.status === 'WAITING' && (
                      <button
                        onClick={() => handleCancel(res.id)}
                        disabled={cancellingIds.has(res.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancellingIds.has(res.id) ? '처리 중...' : '취소'}
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
