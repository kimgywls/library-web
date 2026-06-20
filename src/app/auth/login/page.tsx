'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken, setUser, isLoggedIn } from '@/lib/auth';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace('/books');
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setToken(data.token);
      setUser({ username: data.username, role: data.role });
      router.push('/books');
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">로그인</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
