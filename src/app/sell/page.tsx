'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import ImageUploader, {
  makeInitialImageState,
  uploadImages,
  type ImageState,
} from '@/components/ImageUploader'

const CATEGORIES = [
  '디지털/가전',
  '의류/패션',
  '도서/음반',
  '스포츠/레저',
  '가구/인테리어',
  '생활/주방',
  '게임/취미',
  '기타',
]

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('기타')
  const [location, setLocation] = useState('')
  const [imageState, setImageState] = useState<ImageState>(makeInitialImageState())

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
        return
      }
      setUser(data.user)
      setAuthLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const parsedPrice = parseInt(price.replace(/,/g, ''), 10)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('올바른 가격을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      // 이미지 업로드
      const uploadedUrls = await uploadImages(supabase, user!.id, imageState.newFiles)
      const imageUrls = [...imageState.remainingUrls, ...uploadedUrls]

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          user_id: user!.id,
          title: title.trim(),
          description: description.trim(),
          price: parsedPrice,
          category,
          location: location.trim(),
          image_urls: imageUrls,
        })
        .select('id')
        .single()

      if (insertError) throw insertError

      router.push('/')
    } catch {
      setError('상품 등록 중 오류가 발생했어요. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  const formatPrice = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString('ko-KR') : ''
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl float-animation">🍠</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--goguma-cream)' }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#F0E0C8] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-lg hover:bg-[#FDF6EC] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--goguma-brown)' }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg" style={{ color: 'var(--goguma-brown)' }}>
            판매글 작성
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 fade-in">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* 사진 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--goguma-brown)' }}>
              사진
            </label>
            <ImageUploader
              state={imageState}
              onChange={setImageState}
              maxImages={5}
            />
          </div>

          {/* 제목 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--goguma-brown)' }}>
              제목 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
            </label>
            <input
              type="text"
              className="goguma-input"
              placeholder="상품 이름을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={40}
            />
            <p className="mt-1.5 text-xs text-right" style={{ color: '#B09080' }}>
              {title.length}/40
            </p>
          </div>

          {/* 카테고리 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--goguma-brown)' }}>
              카테고리 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
                  style={
                    category === cat
                      ? { background: 'var(--goguma-orange)', color: 'white', borderColor: 'var(--goguma-orange)' }
                      : { background: 'white', color: 'var(--goguma-brown)', borderColor: '#E8D4B8' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--goguma-brown)' }}>
              가격 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                className="goguma-input pr-8"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#B09080' }}>
                원
              </span>
            </div>
            {price && (
              <p className="mt-1.5 text-sm" style={{ color: 'var(--goguma-orange)' }}>
                {price}원
              </p>
            )}
          </div>

          {/* 거래 장소 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--goguma-brown)' }}>
              거래 희망 장소
            </label>
            <input
              type="text"
              className="goguma-input"
              placeholder="예: 강남역 2번 출구 근처"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* 설명 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--goguma-brown)' }}>
              상품 설명
            </label>
            <textarea
              className="goguma-input resize-none"
              style={{ minHeight: '140px' }}
              placeholder="상품 상태, 구매 시기, 사용감 등을 자세히 적어주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <p className="mt-1.5 text-xs text-right" style={{ color: '#B09080' }}>
              {description.length}/1000
            </p>
          </div>

          {error && (
            <div className="py-2.5 px-3.5 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
              {error}
            </div>
          )}

          <button type="submit" className="goguma-btn-primary" disabled={loading}>
            {loading ? '등록 중...' : '판매글 올리기'}
          </button>
        </form>
      </main>
    </div>
  )
}
