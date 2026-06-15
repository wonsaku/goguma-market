'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function OwnerActions({ productId }: { productId: string }) {
  const router = useRouter()
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.push('/products')
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/products/${productId}/edit`}
        className="flex-1 py-3 rounded-xl font-semibold text-center border transition-colors"
        style={{ background: 'white', color: 'var(--goguma-brown)', borderColor: '#E8D4B8' }}
        onClick={() => setDeleteConfirm(false)}
      >
        수정하기
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex-1 py-3 rounded-xl font-semibold border transition-colors"
        style={
          deleteConfirm
            ? { background: '#D32F2F', color: 'white', borderColor: '#D32F2F' }
            : { background: 'white', color: '#D32F2F', borderColor: '#D32F2F' }
        }
      >
        {deleting ? '삭제 중...' : deleteConfirm ? '정말 삭제?' : '삭제하기'}
      </button>
    </div>
  )
}
