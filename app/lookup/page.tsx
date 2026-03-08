'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function LookupPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/certificate/${code.trim()}`)
      const data = await res.json()

      if (data.success) {
        router.push(`/certificate/${code.trim()}`)
      } else {
        setError('Không tìm thấy chứng thư với mã này. Vui lòng kiểm tra lại.')
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          Tra cứu chứng thư
        </p>

        <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display leading-tight mb-4">
          Tìm chứng thư của bạn
        </h1>

        <p className="text-[#8A7D65] leading-relaxed mb-10">
          Nhập mã chứng thư để xem chi tiết nghi lễ hoa đã được ghi nhận.
        </p>

        <form onSubmit={handleLookup} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8A7D65]" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="NTH-XXXXXXXX"
              className="w-full border border-[#D4AF37]/20 bg-[#0d0b09] pl-12 pr-4 py-4 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 transition-colors font-mono text-lg tracking-wider text-center"
            />
          </div>

          {error && (
            <p className="text-sm text-[#A52525]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!code.trim() || loading}
            className={`w-full py-4 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 ${
              code.trim() && !loading
                ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
                : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
            }`}
          >
            {loading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>
      </div>
    </main>
  )
}
