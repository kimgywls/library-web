'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { isAdmin } from '@/lib/auth';
import type { MemberRole, MemberWithLoanCount, PageResponse } from '@/types';

const ROLE_LABEL: Record<MemberRole, string> = {
  ROLE_ADMIN: '관리자',
  ROLE_USER: '일반',
};

const ROLE_COLOR: Record<MemberRole, string> = {
  ROLE_ADMIN: 'bg-red-100 text-red-700',
  ROLE_USER: 'bg-blue-100 text-blue-700',
};

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PageResponse<MemberWithLoanCount> | null>(null);
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
      .getMembers(page, 10)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [authorized, page]);

  if (!authorized) return null;

  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">회원 목록</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">불러오는 중...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-gray-400">회원이 없습니다.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 font-medium">
                <th className="px-5 py-3">아이디</th>
                <th className="px-5 py-3">닉네임</th>
                <th className="px-5 py-3">이메일</th>
                <th className="px-5 py-3">권한</th>
                <th className="px-5 py-3">가입일</th>
                <th className="px-5 py-3 text-center">현재 대출 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.content.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{member.username}</td>
                  <td className="px-5 py-4 text-gray-700">{member.nickname}</td>
                  <td className="px-5 py-4 text-gray-600">{member.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[member.role]}`}
                    >
                      {ROLE_LABEL[member.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{fmt(member.createdAt)}</td>
                  <td className="px-5 py-4 text-center text-gray-700">{member.activeLoans}</td>
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
