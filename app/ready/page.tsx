'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReadyPage() {
  const router = useRouter()
  const [isReturning, setIsReturning] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const returning = localStorage.getItem('ntt_returning_user') === 'true'
    setIsReturning(returning)
    setTimeout(() => setVisible(true), 100)
  }, [])

  function handleReady() {
    localStorage.setItem('ntt_ritual_step', 'ready')
    if (isReturning) {
      router.push('/checkout')
    } else {
      router.push('/moment')
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6">
      <div className={`max-w-xl text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          Nghi Lễ Hoa
        </p>

        <h1 className="text-3xl md:text-5xl font-light text-[#F5E6C8] font-display leading-tight mb-8">
          Bạn đã sẵn sàng gửi một ý niệm chưa?
        </h1>

        <p className="text-[#8A7D65] leading-relaxed mb-4">
          Nghi lễ hoa là hành trình thiêng liêng. Mỗi bước đi là một lời hứa,
          mỗi lựa chọn là một cam kết từ trái tim.
        </p>

        {isReturning && (
          <div className="mb-8 p-4 border border-[#D4AF37]/20 bg-[#0d0b09]">
            <p className="text-sm text-[#C5A55A]">
              Chào mừng bạn trở lại. Bạn đã từng thực hiện nghi lễ trước đây.
            </p>
            <p className="text-xs text-[#8A7D65] mt-1">
              Bạn có thể đi thẳng đến bước thanh toán.
            </p>
          </div>
        )}

        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-8" />

        <button
          onClick={handleReady}
          className="px-12 py-4 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          {isReturning ? 'Tiếp tục nhanh' : 'Tôi đã sẵn sàng'}
        </button>
      </div>
    </main>
  )
}
