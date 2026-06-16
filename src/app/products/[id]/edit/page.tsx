'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ImageUploader, {
  makeInitialImageState,
  uploadImages,
  deleteImages,
  type ImageState,
} from '@/components/ImageUploader'

const CATEGORIES = ['디지털/가전', '의류/패션', '도서/음반', '스포츠/레저', '가구/인테리어', '생활/주방', '게임/취미', '기타']
const STATUS_OPTIONS = [
  { value: 'available', label: '판매중' },
  { value: 'reserved', label: '예약중' },
  { value: 'sold', label: '판매완료' },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('기타')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('available')
  const [imageState, setImageState] = useState<ImageState>(makeInitialImageState())

  const [pageLoading, setPageLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }

      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (!product) { router.replace('/products'); return }
      if (product.user_id !== user.id) { router.replace(`/products/${id}`); return }

      setTitle(product.title)
      setDescription(product.description ?? '')
      setPrice(product.price.toLocaleString('ko-KR'))
      setCategory(product.category)
      setLocation(product.location ?? '')
      setStatus(product.status)
      setImageState(makeInitialImageState(product.image_urls ?? []))
      setPageLoading(false)
    }
    load()
  }, [id])

  const formatPrice = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString('ko-KR') : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const parsedPrice = parseInt(price.replace(/,/g, ''), 10)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('올바른 가격을 입력해주세요.')
      return
    }
    if (title.trim().length === 0) {
      setError('제목을 입력해주세요.')
      return
    }

    setSubmitting(true)

    try {
      // 삭제된 이미지를 Storage에서 제거
      await deleteImages(supabase, imageState.deletedUrls)

      // 새 이미지 업로드
      const { data: { user } } = await supabase.auth.getUser()
      const uploadedUrls = await uploadImages(supabase, user!.id, imageState.newFiles)
      const finalImageUrls = [...imageState.remainingUrls, ...uploadedUrls]

      const { error: updateError } = await supabase
        .from('products')
        .update({
          title: title.trim(),
          description: description.trim(),
          price: parsedPrice,
          category,
          location: location.trim(),
          status,
          image_urls: finalImageUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push(`/products/${id}`)
      router.refresh()
    } catch {
      setError('수정 중 오류가 발생했어요. 다시 시도해주세요.')
      setSubmitting(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl float-animation">🍠</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--goguma-cream)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-[#F0E0C8] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/products/${id}`} className="p-1.5 rounded-lg hover:bg-[#FDF6EC] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--goguma-brown)' }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="font-bold text-lg" style={{ color: 'var(--goguma-brown)' }}>판매글 수정</h1>
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

          {/* 판매 상태 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--goguma-brown)' }}>
              판매 상태
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={
                    status === opt.value
                      ? { background: 'var(--goguma-orange)', color: 'white', borderColor: 'var(--goguma-orange)' }
                      : { background: 'white', color: 'var(--goguma-brown)', borderColor: '#E8D4B8' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div className="goguma-card p-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--goguma-brown)' }}>
              제목 <span style={{ color: 'var(--goguma-orange)' }}>*</span>
            </label>
            <input
              type="text"
              className="goguma-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={40}
            />
            <p className="mt-1.5 text-xs text-right" style={{ color: '#B09080' }}>{title.length}/40</p>
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
                value={price}
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#B09080' }}>원</span>
            </div>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <p className="mt-1.5 text-xs text-right" style={{ color: '#B09080' }}>{description.length}/1000</p>
          </div>

          {error && (
            <div className="py-2.5 px-3.5 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>
          )}

          <button type="submit" className="goguma-btn-primary" disabled={submitting}>
            {submitting ? '수정 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
