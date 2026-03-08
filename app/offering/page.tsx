'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const offeringOptions = [
  {
    id: 'lotus',
    name: 'Lotus flower',
    label: 'Hoa Sen',
    description: 'Biểu tượng của sự thuần khiết và giác ngộ.',
    emoji: '🪷',
  },
  {
    id: 'lily',
    name: 'White lily',
    label: 'Hoa Lily Trắng',
    description: 'Sự trong trẻo, thanh cao và lòng chân thành.',
    emoji: '🤍',
  },
  {
    id: 'peony',
    name: 'Peony',
    label: 'Hoa Mẫu Đơn',
    description: 'Sự thịnh vượng, may mắn và tình yêu trọn vẹn.',
    emoji: '🌸',
  },
  {
    id: 'rose',
    name: 'Rose',
    label: 'Hoa Hồng',
    description: 'Tình yêu vĩnh cửu, đam mê và sự cam kết.',
    emoji: '🌹',
  },
]

export default function OfferingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const step = localStorage.getItem('ntt_ritual_step')
    if (step !== 'ritual') {
      router.push('/ready')
      return
    }
    setTimeout(() => setVisible(true), 100)
  }, [router])

  function handleContinue() {
    if (!selected) return
    const offering = offeringOptions.find(o => o.id === selected)
    localStorage.setItem('ntt_offering', offering?.name || '')
    localStorage.setItem('ntt_ritual_step', 'offering')
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6 py-20">
      <div className={`max-w-2xl w-full text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          Vật Chứng
        </p>

        <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display leading-tight mb-4">
          Chọn vật chứng thiêng liêng
        </h1>

        <p className="text-[#8A7D65] leading-relaxed mb-10">
          Vật chứng là biểu tượng cho ý niệm bạn muốn gửi gắm. Hãy chọn loài hoa phù hợp với tâm nguyện.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {offeringOptions.map((option) => {
            const isSelected = selected === option.id
            return (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`p-6 border text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-[#D4AF37]/20 bg-[#0d0b09] hover:border-[#D4AF37]/40'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <h3 className={`text-sm tracking-wider uppercase font-medium ${isSelected ? 'text-[#D4AF37]' : 'text-[#C5A55A]'}`}>
                    {option.label}
                  </h3>
                </div>
                <p className="text-xs text-[#8A7D65] leading-relaxed">
                  {option.description}
                </p>
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`px-12 py-4 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 ${
            selected
              ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
              : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
          }`}
        >
          Tiếp tục đến thanh toán
        </button>
      </div>
    </main>
  )
}
