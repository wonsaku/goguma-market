'use client'

import { useRef, useEffect } from 'react'

export interface ImageState {
  remainingUrls: string[]  // 기존 이미지 중 유지할 URL
  newFiles: File[]         // 새로 추가할 파일
  deletedUrls: string[]    // 삭제된 기존 이미지 URL
}

interface Props {
  initialUrls?: string[]
  onChange: (state: ImageState) => void
  state: ImageState
  maxImages?: number
}

export function makeInitialImageState(urls: string[] = []): ImageState {
  return { remainingUrls: urls, newFiles: [], deletedUrls: [] }
}

export default function ImageUploader({ initialUrls = [], onChange, state, maxImages = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrls = useRef<Map<File, string>>(new Map())

  // 컴포넌트 언마운트 시 objectURL 해제
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const getPreview = (file: File) => {
    if (!previewUrls.current.has(file)) {
      previewUrls.current.set(file, URL.createObjectURL(file))
    }
    return previewUrls.current.get(file)!
  }

  const totalCount = state.remainingUrls.length + state.newFiles.length
  const canAdd = totalCount < maxImages

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const remaining = maxImages - totalCount
    const toAdd = files.slice(0, remaining)

    onChange({ ...state, newFiles: [...state.newFiles, ...toAdd] })
    e.target.value = ''
  }

  const removeExisting = (url: string) => {
    onChange({
      ...state,
      remainingUrls: state.remainingUrls.filter((u) => u !== url),
      deletedUrls: [...state.deletedUrls, url],
    })
  }

  const removeNew = (file: File) => {
    const preview = previewUrls.current.get(file)
    if (preview) {
      URL.revokeObjectURL(preview)
      previewUrls.current.delete(file)
    }
    onChange({ ...state, newFiles: state.newFiles.filter((f) => f !== file) })
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {/* 추가 버튼 */}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ borderColor: '#E8D4B8', background: '#FDF6EC' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#C4611A' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs font-medium" style={{ color: '#C4611A' }}>사진 추가</span>
          </button>
        )}

        {/* 기존 이미지 */}
        {state.remainingUrls.map((url) => (
          <div key={url} className="relative w-24 h-24 flex-shrink-0">
            <img
              src={url}
              alt="상품 이미지"
              className="w-24 h-24 rounded-xl object-cover"
              style={{ border: '1px solid #F0E0C8' }}
            />
            <button
              type="button"
              onClick={() => removeExisting(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
              style={{ background: '#5A4030', color: 'white' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}

        {/* 새로 추가된 이미지 */}
        {state.newFiles.map((file) => (
          <div key={file.name + file.size} className="relative w-24 h-24 flex-shrink-0">
            <img
              src={getPreview(file)}
              alt="새 이미지"
              className="w-24 h-24 rounded-xl object-cover"
              style={{ border: '1px solid #F0E0C8' }}
            />
            <button
              type="button"
              onClick={() => removeNew(file)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
              style={{ background: '#5A4030', color: 'white' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {/* 업로드 대기 표시 */}
            <div className="absolute bottom-1 left-1 text-xs px-1 rounded" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
              새 사진
            </div>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs" style={{ color: '#B09080' }}>
        {totalCount}/{maxImages}장 · JPG, PNG, WEBP · 장당 최대 5MB
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// 이미지를 Supabase Storage에 업로드하고 공개 URL 배열 반환
export async function uploadImages(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  userId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file)

    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    urls.push(publicUrl)
  }

  return urls
}

// Storage에서 이미지 삭제 (공개 URL → 경로 추출)
export async function deleteImages(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  urls: string[]
): Promise<void> {
  if (!urls.length) return

  const paths = urls.map((url) => {
    const marker = '/object/public/product-images/'
    const idx = url.indexOf(marker)
    return idx !== -1 ? url.slice(idx + marker.length) : ''
  }).filter(Boolean)

  if (paths.length) {
    await supabase.storage.from('product-images').remove(paths)
  }
}
