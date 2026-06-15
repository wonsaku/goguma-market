import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* 히어로 섹션 */}
      <main className="flex-1">
        <section className="goguma-gradient py-20 px-4 text-center text-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6 float-animation inline-block">🍠</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              우리 동네 따뜻한<br />중고거래
            </h1>
            <p className="text-lg opacity-90 mb-8">
              고구마마켓에서 이웃과 안전하게 거래하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-white rounded-full font-semibold text-base transition-transform hover:scale-105"
                style={{ color: 'var(--goguma-orange)' }}
              >
                시작하기
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border-2 border-white rounded-full font-semibold text-base text-white transition-transform hover:scale-105 hover:bg-white/10"
              >
                로그인
              </Link>
            </div>
          </div>
        </section>

        {/* 특징 소개 */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl font-bold mb-12" style={{ color: 'var(--goguma-brown)' }}>
              왜 고구마마켓인가요?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="goguma-card p-6 text-center fade-in">
                  <div className="text-4xl mb-4">{f.emoji}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--goguma-brown)' }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#7A6050' }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4 text-center" style={{ background: 'var(--goguma-warm)' }}>
          <p className="text-lg font-semibold mb-4" style={{ color: 'var(--goguma-brown)' }}>
            지금 바로 시작해보세요 🍠
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-3 rounded-full font-bold text-white goguma-gradient transition-opacity hover:opacity-90"
          >
            무료 회원가입
          </Link>
        </section>
      </main>

      <footer className="py-6 text-center text-sm" style={{ color: '#B09080', borderTop: '1px solid #F0E0C8' }}>
        © 2026 고구마마켓 — 따뜻한 중고거래의 시작
      </footer>
    </div>
  )
}

const features = [
  {
    emoji: '🤝',
    title: '안전한 거래',
    desc: '이웃 간의 신뢰를 바탕으로 안심하고 거래할 수 있어요.',
  },
  {
    emoji: '📍',
    title: '우리 동네',
    desc: '가까운 이웃과 직거래로 배송비 걱정 없이 편리하게!',
  },
  {
    emoji: '♻️',
    title: '가치 있는 나눔',
    desc: '쓰지 않는 물건에 새 생명을 불어넣어 환경도 지켜요.',
  },
]
