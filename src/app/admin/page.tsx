'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi, booksApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [overdueLoans, setOverdueLoans] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    if (!isAdmin()) {
      router.replace('/books');
      return;
    }
    setAuthorized(true);
    Promise.all([
      booksApi.getAll({ page: 0, size: 1 }),
      adminApi.getLoans(0, 1, 'ACTIVE'),
      adminApi.getLoans(0, 1, 'OVERDUE'),
      adminApi.getMembers(0, 1),
    ])
      .then(([books, active, overdue, members]) => {
        setTotalBooks(books.totalElements);
        setActiveLoans(active.totalElements);
        setOverdueLoans(overdue.totalElements);
        setTotalMembers(members.totalElements);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (!authorized) return null;

  const cards = [
    { label: '전체 도서', value: totalBooks, href: '/books',
      bg: 'bg-blue-50', border: 'border-blue-200', label2: 'text-blue-600', num: 'text-blue-900' },
    { label: '대출 중', value: activeLoans, href: '/admin/loans',
      bg: 'bg-green-50', border: 'border-green-200', label2: 'text-green-600', num: 'text-green-900' },
    { label: '연체 중', value: overdueLoans, href: '/admin/loans',
      bg: 'bg-red-50', border: 'border-red-200', label2: 'text-red-600', num: 'text-red-900' },
    { label: '전체 회원', value: totalMembers, href: '/admin/members',
      bg: 'bg-purple-50', border: 'border-purple-200', label2: 'text-purple-600', num: 'text-purple-900' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 대시보드</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={`rounded-xl border ${card.bg} ${card.border} p-6 flex flex-col gap-3 hover:shadow-md transition-shadow`}
              >
                <span className={`text-sm font-medium ${card.label2}`}>{card.label}</span>
                <span className={`text-4xl font-bold ${card.num}`}>{card.value.toLocaleString()}</span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/loans"
              className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-gray-900 mb-1">전체 대출 현황</p>
              <p className="text-sm text-gray-500">대출 상태 필터 및 목록 조회</p>
            </Link>
            <Link
              href="/admin/reservations"
              className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-gray-900 mb-1">전체 예약 현황</p>
              <p className="text-sm text-gray-500">예약 목록 조회</p>
            </Link>
            <Link
              href="/admin/members"
              className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <p className="font-semibold text-gray-900 mb-1">회원 목록</p>
              <p className="text-sm text-gray-500">전체 회원 정보 조회</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
