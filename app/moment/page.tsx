'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function MomentPage() {
  const router = useRouter()
  const [moment, setMoment] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const step = localStorage.getItem('ntt_ritual_step')
    if (step !== 'ready') {
      router.push('/ready')
      return
    }
    setTimeout(() => setVisible(true), 100)
  }, [router])

  function handleContinue() {
    if (!moment.trim()) return
    localStorage.setItem('ntt_moment', moment)
    localStorage.setItem('ntt_ritual_step', 'moment')
    router.push('/ritual')
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6">
      <div className={`max-w-xl w-full text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          Khoảnh Khắc
        </p>

        <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display leading-tight mb-4">
          Khoảnh khắc này dành cho điều gì?
        </h1>

        <p className="text-[#8A7D65] leading-relaxed mb-10">
          Hãy mô tả khoảnh khắc hoặc ý niệm mà bạn muốn gửi gắm qua đóa hoa này.
        </p>

        <div className="border border-[#D4AF37]/20 bg-[#0d0b09] p-1 mb-8">
          <textarea
            value={moment}
            onChange={(e) => setMoment(e.target.value)}
            placeholder="Mô tả khoảnh khắc hoặc ý niệm của bạn..."
            rows={5}
            className="w-full bg-transparent px-4 py-3 text-[#F5E6C8] placeholder:text-[#555040] resize-none focus:outline-none italic leading-8 font-serif text-base"
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={!moment.trim()}
          className={`px-12 py-4 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 ${
            moment.trim()
              ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
              : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
          }`}
        >
          Tiếp tục
        </button>
      </div>
    </main>
  )
}
