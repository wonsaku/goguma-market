import Link from 'next/link'

export type Product = {
  id: string
  title: string
  price: number
  category: string
  location: string | null
  status: string
  created_at: string
  profiles: {
    nickname: string
  } | null
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function ProductCard({ product }: { product: Product }) {
  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="goguma-card p-4 flex gap-4 hover:shadow-md transition-shadow">
        {/* 이미지 자리 */}
        <div
          className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
          style={{ background: 'var(--goguma-warm)' }}
        >
          {getCategoryEmoji(product.category)}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-2">
              {(isSold || isReserved) && (
                <span
                  className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={
                    isSold
                      ? { background: '#EEE', color: '#888' }
                      : { background: '#FFF0E0', color: 'var(--goguma-orange)' }
                  }
                >
                  {isSold ? '판매완료' : '예약중'}
                </span>
              )}
              <p
                className="text-base font-medium leading-snug truncate"
                style={{ color: isSold ? '#AAA' : 'var(--goguma-text)' }}
              >
                {product.title}
              </p>
            </div>
            <p className="text-xs mt-1" style={{ color: '#B09080' }}>
              {product.category}
            </p>
          </div>

          <div>
            <p className="text-base font-bold mt-1" style={{ color: 'var(--goguma-brown)' }}>
              {product.price.toLocaleString('ko-KR')}원
            </p>
            <p className="text-xs mt-1" style={{ color: '#C0A090' }}>
              {product.location && `${product.location} · `}
              {timeAgo(product.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function getCategoryEmoji(category: string) {
  const map: Record<string, string> = {
    '디지털/가전': '📱',
    '의류/패션': '👗',
    '도서/음반': '📚',
    '스포츠/레저': '⚽',
    '가구/인테리어': '🪑',
    '생활/주방': '🍳',
    '게임/취미': '🎮',
    '기타': '📦',
  }
  return map[category] ?? '📦'
}
