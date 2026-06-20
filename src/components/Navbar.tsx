'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isLoggedIn, isAdmin, removeToken, removeUser } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setAdmin(isAdmin());
  }, [pathname]);

  function handleLogout() {
    removeToken();
    removeUser();
    setLoggedIn(false);
    setAdmin(false);
    router.push('/auth/login');
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          도서관 시스템
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/books" className="text-gray-600 hover:text-blue-600 transition-colors">
            도서 목록
          </Link>

          {loggedIn ? (
            <>
              {admin ? (
                <>
                <Link href="/admin/members" className="text-gray-600 hover:text-blue-600 transition-colors">
                    전체 회원목록
                  </Link>
                  <Link href="/admin/loans" className="text-gray-600 hover:text-blue-600 transition-colors">
                    전체 대출목록
                  </Link>
                  <Link href="/admin/reservations" className="text-gray-600 hover:text-blue-600 transition-colors">
                    전체 예약목록
                  </Link>
                  <Link href="/admin" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                    관리자
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/loans" className="text-gray-600 hover:text-blue-600 transition-colors">
                    내 대출
                  </Link>
                  <Link href="/reservations" className="text-gray-600 hover:text-blue-600 transition-colors">
                    내 예약
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
