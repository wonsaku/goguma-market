'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles: { nickname: string } | null
}

interface Props {
  productId: string
  currentUserId: string | null
  initialComments: Comment[]
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function CommentsSection({ productId, currentUserId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  /* ── 댓글 등록 ── */
  const handleAdd = async () => {
    if (!newContent.trim()) return
    if (!currentUserId) { router.push('/login'); return }

    setSubmitting(true)
    setError('')

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({ user_id: currentUserId, product_id: productId, content: newContent.trim() })
      .select('*, profiles(nickname)')
      .single()

    if (insertError) {
      setError('댓글 등록 중 오류가 발생했어요.')
    } else if (data) {
      setComments((prev) => [...prev, data as Comment])
      setNewContent('')
    }
    setSubmitting(false)
  }

  /* ── 댓글 수정 시작 ── */
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
    setError('')
  }

  /* ── 댓글 수정 저장 ── */
  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return

    setSubmitting(true)
    setError('')

    const { error: updateError } = await supabase
      .from('comments')
      .update({ content: editContent.trim(), updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      setError('댓글 수정 중 오류가 발생했어요.')
    } else {
      setComments((prev) =>
        prev.map((c) => c.id === id ? { ...c, content: editContent.trim() } : c)
      )
      setEditingId(null)
    }
    setSubmitting(false)
  }

  /* ── 댓글 삭제 ── */
  const handleDelete = async (id: string) => {
    if (!window.confirm('댓글을 삭제할까요?')) return

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError('댓글 삭제 중 오류가 발생했어요.')
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="py-5 border-t border-[#F0E0C8]">

      {/* 헤더 */}
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--goguma-brown)' }}>
        댓글 <span style={{ color: 'var(--goguma-orange)' }}>{comments.length}</span>
      </p>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: '#B09080' }}>
          첫 번째 댓글을 남겨보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-5 mb-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* 아바타 */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #C4611A, #7B4F8C)' }}
              >
                {comment.profiles?.nickname?.[0] ?? '?'}
              </div>

              <div className="flex-1 min-w-0">
                {/* 닉네임 + 시간 + 수정/삭제 버튼 */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: 'var(--goguma-brown)' }}>
                    {comment.profiles?.nickname ?? '알 수 없음'}
                  </span>
                  <span className="text-xs" style={{ color: '#B09080' }}>
                    {timeAgo(comment.created_at)}
                  </span>
                  {comment.user_id === currentUserId && editingId !== comment.id && (
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => startEdit(comment)}
                        className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-[#FDF6EC]"
                        style={{ color: '#B09080' }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-red-50"
                        style={{ color: '#D08080' }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>

                {/* 본문 또는 수정 인풋 */}
                {editingId === comment.id ? (
                  <div>
                    <textarea
                      className="goguma-input resize-none text-sm"
                      style={{ minHeight: 72 }}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      maxLength={500}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(comment.id)}
                        disabled={submitting || !editContent.trim()}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                        style={{ background: 'var(--goguma-orange)' }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                        style={{ borderColor: '#E8D4B8', color: 'var(--goguma-brown)' }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#5A4030' }}>
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </p>
      )}

      {/* 댓글 입력 영역 */}
      {currentUserId ? (
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            className="goguma-input resize-none text-sm flex-1"
            style={{ minHeight: 60 }}
            placeholder="댓글을 입력하세요 (최대 500자)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd()
            }}
          />
          <button
            onClick={handleAdd}
            disabled={submitting || !newContent.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-opacity disabled:opacity-40"
            style={{ background: 'var(--goguma-orange)', height: 60 }}
          >
            {submitting ? '...' : '등록'}
          </button>
        </div>
      ) : (
        <div
          className="text-center py-4 rounded-xl border border-dashed"
          style={{ borderColor: '#E8D4B8' }}
        >
          <p className="text-sm mb-2" style={{ color: '#B09080' }}>
            댓글을 작성하려면 로그인이 필요해요
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-sm font-semibold px-4 py-1.5 rounded-full"
            style={{ background: 'var(--goguma-orange)', color: 'white' }}
          >
            로그인하기
          </button>
        </div>
      )}
    </div>
  )
}
