'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Heart, Sparkles, Leaf, Link2 } from 'lucide-react'

const ritualOptions = [
  {
    id: 'love',
    name: 'Love Blessing',
    label: 'Phước lành tình yêu',
    description: 'Gửi gắm tình yêu và sự che chở đến người thương.',
    icon: Heart,
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    label: 'Lòng biết ơn',
    description: 'Thể hiện sự tri ân sâu sắc với người đã mang ý nghĩa đến cuộc đời.',
    icon: Sparkles,
  },
  {
    id: 'healing',
    name: 'Healing',
    label: 'Chữa lành',
    description: 'Gửi năng lượng chữa lành và bình an đến tâm hồn.',
    icon: Leaf,
  },
  {
    id: 'reconnection',
    name: 'Reconnection',
    label: 'Kết nối lại',
    description: 'Nối lại sợi dây yêu thương đã lỡ xa cách.',
    icon: Link2,
  },
]

export default function RitualPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const step = localStorage.getItem('ntt_ritual_step')
    if (step !== 'moment') {
      router.push('/ready')
      return
    }
    setTimeout(() => setVisible(true), 100)
  }, [router])

  function handleContinue() {
    if (!selected) return
    const ritual = ritualOptions.find(r => r.id === selected)
    localStorage.setItem('ntt_ritual_type', ritual?.name || '')
    localStorage.setItem('ntt_ritual_step', 'ritual')
    router.push('/offering')
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6 py-20">
      <div className={`max-w-2xl w-full text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          Nghi Thức
        </p>

        <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display leading-tight mb-4">
          Chọn nghi thức của bạn
        </h1>

        <p className="text-[#8A7D65] leading-relaxed mb-10">
          Mỗi nghi thức mang một ý nghĩa riêng. Hãy chọn nghi thức phù hợp với tâm nguyện của bạn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {ritualOptions.map((option) => {
            const Icon = option.icon
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
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-[#D4AF37]' : 'text-[#8A7D65]'}`} />
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
          Tiếp tục
        </button>
      </div>
    </main>
  )
}
