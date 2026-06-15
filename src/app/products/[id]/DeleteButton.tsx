'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true)
      return
    }
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    router.push('/products')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 py-3 rounded-xl font-semibold border transition-colors"
      style={
        confirm
          ? { background: '#D32F2F', color: 'white', borderColor: '#D32F2F' }
          : { background: 'white', color: '#D32F2F', borderColor: '#D32F2F' }
      }
    >
      {loading ? '삭제 중...' : confirm ? '정말 삭제할까요?' : '판매글 삭제'}
    </button>
  )
}
