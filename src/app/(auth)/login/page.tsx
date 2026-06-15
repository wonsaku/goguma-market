'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* 배경 장식 */}
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, #C4611A 0%, transparent 50%), radial-gradient(circle at 70% 80%, #7B4F8C 0%, transparent 50%)',
        }}
      />

      <div className="w-full max-w-sm fade-in">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-5xl float-animation inline-block">🍠</span>
            <p className="mt-2 text-xl font-bold" style={{ color: 'var(--goguma-orange)' }}>
              고구마마켓
            </p>
          </Link>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--goguma-brown)' }}>
            로그인
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9A7860' }}>
            반가워요! 다시 돌아오셨군요 😊
          </p>
        </div>

        {/* 카드 */}
        <div className="goguma-card p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--goguma-brown)' }}>
                이메일
              </label>
              <input
                type="email"
                className="goguma-input"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--goguma-brown)' }}>
                비밀번호
              </label>
              <input
                type="password"
                className="goguma-input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="py-2.5 px-3.5 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <button type="submit" className="goguma-btn-primary mt-1" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center mt-5 text-sm" style={{ color: '#9A7860' }}>
          아직 계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="font-semibold hover:underline"
            style={{ color: 'var(--goguma-orange)' }}
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
