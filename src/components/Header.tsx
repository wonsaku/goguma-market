'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#F0E0C8] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: 'var(--goguma-orange)' }}>
          <span className="text-2xl">🍠</span>
          <span>고구마마켓</span>
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="text-sm hidden sm:block" style={{ color: 'var(--goguma-brown)' }}>
                {user.email?.split('@')[0]}님
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-[#E8D4B8] hover:bg-[#FDF6EC] transition-colors"
                style={{ color: 'var(--goguma-brown)' }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-[#E8D4B8] hover:bg-[#FDF6EC] transition-colors"
                style={{ color: 'var(--goguma-brown)' }}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-white transition-colors goguma-gradient"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
