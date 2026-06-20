'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import type { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterRequest>({
    username: '',
    password: '',
    nickname: '',
    email: '',
  });
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
      await authApi.register(form);
      router.push('/auth/login');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const fields: { name: keyof RegisterRequest; label: string; type: string; placeholder: string; autoComplete: string }[] = [
    { name: 'username', label: '아이디', type: 'text', placeholder: '아이디를 입력하세요', autoComplete: 'username' },
    { name: 'password', label: '비밀번호', type: 'password', placeholder: '비밀번호를 입력하세요', autoComplete: 'new-password' },
    { name: 'nickname', label: '닉네임', type: 'text', placeholder: '닉네임을 입력하세요', autoComplete: 'nickname' },
    { name: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com', autoComplete: 'email' },
  ];

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">회원가입</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map(({ name, label, type, placeholder, autoComplete }) => (
            <div key={name} className="flex flex-col gap-1">
              <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                required
                autoComplete={autoComplete}
                value={form[name]}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
