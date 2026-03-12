'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { momentsPageText } from '@/content/momentsText'

interface VowCard {
  sender_name: string
  receiver_name: string
  message: string
  public_vow?: boolean
}

export default function MomentsPage() {
  const router = useRouter()
  const [vows, setVows] = useState<VowCard[]>([])
  const [visible, setVisible] = useState(false)
  const [cardsVisible, setCardsVisible] = useState<boolean[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    loadVows()
  }, [])

  async function loadVows() {
    try {
      const res = await fetch('/api/vows?limit=6')
      const json = await res.json()

      if (json.success && json.vows && json.vows.length > 0) {
        setVows(json.vows)
        setCardsVisible(new Array(json.vows.length).fill(false))
      } else {
        const fallback = momentsPageText.fallbackCards.map(c => ({
          sender_name: c.sender,
          receiver_name: c.receiver,
          message: c.message,
          public_vow: true
        }))
        setVows(fallback)
        setCardsVisible(new Array(fallback.length).fill(false))
      }
    } catch {
      const fallback = momentsPageText.fallbackCards.map(c => ({
        sender_name: c.sender,
        receiver_name: c.receiver,
        message: c.message,
        public_vow: true
      }))
      setVows(fallback)
      setCardsVisible(new Array(fallback.length).fill(false))
    }
  }

  useEffect(() => {
    if (vows.length === 0) return
    vows.forEach((_, i) => {
      setTimeout(() => {
        setCardsVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, 300 + i * 200)
    })
  }, [vows])

  function handleReady() {
    router.push('/ready')
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] px-6 py-20">
      <div className={`max-w-4xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
            {momentsPageText.label}
          </p>

          <h1 className="text-3xl md:text-5xl font-light text-[#F5E6C8] font-display leading-tight mb-6">
            {momentsPageText.title}
          </h1>

          <p className="text-[#8A7D65] leading-relaxed text-base whitespace-pre-line max-w-lg mx-auto">
            {momentsPageText.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {vows.map((vow, i) => {
            const isAnonymous = vow.public_vow === false
            return (
              <div
                key={i}
                className={`p-8 border border-[#D4AF37]/20 bg-[#0d0b09] transition-all duration-700 hover:border-[#D4AF37]/40 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] ${
                  cardsVisible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <p className="text-sm text-[#D4AF37] tracking-wider mb-4 font-medium">
                  {isAnonymous
                    ? momentsPageText.anonymousLabel
                    : `${vow.sender_name} ❤ ${vow.receiver_name}`
                  }
                </p>
                <p className="text-[#C5A55A]/90 italic leading-relaxed text-sm font-display">
                  &ldquo;{vow.message}&rdquo;
                </p>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-8" />

          <p className="text-lg md:text-xl text-[#F5E6C8]/80 italic font-display mb-12">
            &ldquo;{momentsPageText.bottomQuote}&rdquo;
          </p>

          <button
            onClick={handleReady}
            className="px-12 py-4 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            {momentsPageText.button}
          </button>
        </div>
      </div>
    </main>
  )
}
