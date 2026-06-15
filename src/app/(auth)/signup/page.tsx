'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    if (nickname.trim().length < 2) {
      setError('닉네임은 2자 이상이어야 해요.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname: nickname.trim() },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일이에요.')
      } else {
        setError('회원가입 중 오류가 발생했어요. 다시 시도해주세요.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center fade-in">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--goguma-brown)' }}>
            거의 다 왔어요!
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#9A7860' }}>
            <strong>{email}</strong>로 인증 메일을 보냈어요.<br />
            메일함을 확인하고 링크를 클릭해 가입을 완료해주세요.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 rounded-full font-semibold text-white goguma-gradient"
          >
            로그인 페이지로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 20%, #7B4F8C 0%, transparent 50%), radial-gradient(circle at 30% 80%, #C4611A 0%, transparent 50%)',
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
            회원가입
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#9A7860' }}>
            이웃과 함께 따뜻한 거래를 시작해요 🍠
          </p>
        </div>

        <div className="goguma-card p-6">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--goguma-brown)' }}>
                닉네임
              </label>
              <input
                type="text"
                className="goguma-input"
                placeholder="사용할 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={20}
              />
            </div>

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
                placeholder="6자 이상 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--goguma-brown)' }}>
                비밀번호 확인
              </label>
              <input
                type="password"
                className="goguma-input"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="py-2.5 px-3.5 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            <button type="submit" className="goguma-btn-primary mt-1" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm" style={{ color: '#9A7860' }}>
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--goguma-orange)' }}
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
