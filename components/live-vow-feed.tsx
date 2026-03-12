'use client'

import { useEffect, useRef, useState } from 'react'
import { liveFeedText } from '@/content/momentsText'

interface Vow {
  sender_name: string
  receiver_name: string
  message: string
  public_vow?: boolean
  created_at: string
}

const fallbackVows: Vow[] = [
  {
    sender_name: "Minh",
    receiver_name: "Lan",
    message: "Anh chọn em. Không phải hôm nay. Mà là mãi mãi.",
    public_vow: true,
    created_at: new Date().toISOString()
  },
  {
    sender_name: "Hoàng",
    receiver_name: "Mai",
    message: "Giữa vạn người, anh chỉ nhìn thấy duy nhất một sự tồn tại.",
    public_vow: true,
    created_at: new Date().toISOString()
  },
  {
    sender_name: "Quốc",
    receiver_name: "An",
    message: "Lời thề này không có ngày hết hạn.",
    public_vow: true,
    created_at: new Date().toISOString()
  }
]

export function LiveVowFeed() {
  const [vows, setVows] = useState<Vow[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState<boolean[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadVows()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          vows.forEach((_, i) => {
            setTimeout(() => {
              setCardsVisible(prev => {
                const next = [...prev]
                next[i] = true
                return next
              })
            }, 200 + i * 300)
          })
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [vows])

  async function loadVows() {
    try {
      const res = await fetch('/api/vows')
      const json = await res.json()

      if (json.success && json.vows && json.vows.length > 0) {
        setVows(json.vows)
        setCardsVisible(new Array(json.vows.length).fill(false))
      } else {
        setVows(fallbackVows)
        setCardsVisible(new Array(fallbackVows.length).fill(false))
      }
    } catch {
      setVows(fallbackVows)
      setCardsVisible(new Array(fallbackVows.length).fill(false))
    }
  }

  if (vows.length === 0) return null

  return (
    <section ref={sectionRef} className="border-t border-border/30 bg-[#0a0a08]">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className={`text-center mb-14 transition-all duration-[1200ms] ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-4">
            {liveFeedText.label}
          </p>
          <h2 className="text-2xl md:text-4xl font-light text-[#F5E6C8] font-display mb-4">
            {liveFeedText.title}
          </h2>
          <p className="text-[#8A7D65] text-sm">
            {liveFeedText.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vows.map((vow, i) => {
            const isAnonymous = vow.public_vow === false
            return (
              <div
                key={i}
                className={`p-8 border border-[#D4AF37]/15 bg-[#0d0b09] transition-all duration-700 hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] ${
                  cardsVisible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <p className="text-sm text-[#D4AF37] tracking-wider mb-4 font-medium">
                  {isAnonymous
                    ? liveFeedText.anonymousLabel
                    : `${vow.sender_name} ❤ ${vow.receiver_name}`
                  }
                </p>
                <p className="text-[#C5A55A]/90 italic leading-relaxed text-sm font-display">
                  &ldquo;{vow.message}&rdquo;
                </p>
                <div className="h-px w-8 bg-gradient-to-r from-[#D4AF37]/30 to-transparent mt-6" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
