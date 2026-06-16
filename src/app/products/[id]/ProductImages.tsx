'use client'

import { useState } from 'react'

export default function ProductImages({ urls }: { urls: string[] }) {
  const [current, setCurrent] = useState(0)

  if (urls.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + urls.length) % urls.length)
  const next = () => setCurrent((c) => (c + 1) % urls.length)

  return (
    <div className="relative w-full" style={{ height: 320, background: '#1a1a1a' }}>
      {/* 메인 이미지 */}
      <img
        src={urls[current]}
        alt={`상품 이미지 ${current + 1}`}
        className="w-full h-full object-contain"
      />

      {/* 좌우 버튼 (이미지 2장 이상일 때만) */}
      {urls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* 인디케이터 (점) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                  width: i === current ? 16 : 6,
                }}
              />
            ))}
          </div>

          {/* 장수 표시 */}
          <div
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            {current + 1}/{urls.length}
          </div>
        </>
      )}
    </div>
  )
}
