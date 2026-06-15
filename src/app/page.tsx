import Header from '@/components/Header'
import ProductCard, { type Product } from '@/components/ProductCard'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const CATEGORIES = ['전체', '디지털/가전', '의류/패션', '도서/음반', '스포츠/레저', '가구/인테리어', '생활/주방', '게임/취미', '기타']

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('id, title, price, category, location, status, created_at, profiles(nickname)')
    .order('created_at', { ascending: false })
    .limit(40)

  if (category && category !== '전체') {
    query = query.eq('category', category)
  }

  const { data: products } = await query

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = (!category && cat === '전체') || category === cat
            return (
              <Link
                key={cat}
                href={cat === '전체' ? '/' : `/?category=${encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={
                  isActive
                    ? { background: 'var(--goguma-orange)', color: 'white', borderColor: 'var(--goguma-orange)' }
                    : { background: 'white', color: 'var(--goguma-brown)', borderColor: '#E8D4B8' }
                }
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {/* 상품 목록 */}
        {products && products.length > 0 ? (
          <div className="flex flex-col gap-3 fade-in">
            {(products as unknown as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center fade-in">
            <div className="text-5xl mb-4 float-animation">🍠</div>
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--goguma-brown)' }}>
              아직 등록된 상품이 없어요
            </p>
            <p className="text-sm mb-6" style={{ color: '#B09080' }}>
              첫 번째 판매글을 올려보세요!
            </p>
            <Link
              href="/sell"
              className="px-6 py-2.5 rounded-full text-sm font-semibold text-white goguma-gradient"
            >
              판매글 작성하기
            </Link>
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-sm" style={{ color: '#B09080', borderTop: '1px solid #F0E0C8' }}>
        © 2026 고구마마켓 — 따뜻한 중고거래의 시작
      </footer>
    </div>
  )
}
