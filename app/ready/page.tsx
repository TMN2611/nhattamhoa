'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { readyPageText } from '@/content/ritualText'

export default function ReadyPage() {
  const router = useRouter()
  const [isReturning, setIsReturning] = useState(false)
  const [visible, setVisible] = useState(false)
  const [questionsVisible, setQuestionsVisible] = useState<boolean[]>([false, false])

  useEffect(() => {
    const returning = localStorage.getItem('ntt_returning_user') === 'true'
    setIsReturning(returning)
    setTimeout(() => setVisible(true), 100)

    readyPageText.questions.forEach((_, i) => {
      setTimeout(() => {
        setQuestionsVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, 800 + i * 600)
    })
  }, [])

  function handleReady() {
    localStorage.setItem('ntt_ritual_step', 'ready')
    if (isReturning) {
      router.push('/checkout')
    } else {
      router.push('/moment')
    }
  }

  function handleNotReady() {
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className={`max-w-xl text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-gold mb-6">
          {readyPageText.label}
        </p>

        <h1 className="text-3xl md:text-5xl font-light text-foreground font-display leading-tight mb-4">
          {readyPageText.title}
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-10 text-base">
          {readyPageText.subtitle}
        </p>

        {isReturning && (
          <div className="mb-8 p-4 border border-gold/20 bg-card">
            <p className="text-sm text-gold">
              Chào mừng bạn trở lại. Bạn đã từng thực hiện nghi lễ trước đây.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bạn có thể đi thẳng đến bước thanh toán.
            </p>
          </div>
        )}

        <div className="mb-10">
          <p className="text-sm tracking-[0.2em] uppercase text-gold mb-6">
            {readyPageText.sectionTitle}
          </p>

          <div className="space-y-6">
            {readyPageText.questions.map((q, i) => (
              <p
                key={i}
                className={`text-lg md:text-xl text-foreground/80 italic font-display leading-relaxed transition-all duration-1000 ${
                  questionsVisible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                &ldquo;{q}&rdquo;
              </p>
            ))}
          </div>
        </div>

        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-6" />

        <p className="text-sm text-muted-foreground italic mb-10">
          {readyPageText.divider}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleNotReady}
            className="group px-8 py-4 border border-gold/30 text-gold tracking-[0.15em] uppercase text-sm transition-all duration-500 hover:border-gold/60 hover:text-foreground"
          >
            <span className="block">{readyPageText.secondaryButton}</span>
            <span className="block text-[10px] text-muted-foreground mt-1 tracking-normal normal-case group-hover:text-gold transition-colors">
              {readyPageText.secondarySubtext}
            </span>
          </button>

          <button
            onClick={handleReady}
            className="group px-10 py-4 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            <span className="block">{isReturning ? 'Tiếp tục nhanh' : readyPageText.primaryButton}</span>
            <span className="block text-[10px] text-[#0a0a08]/70 mt-1 tracking-normal normal-case">
              {readyPageText.primarySubtext}
            </span>
          </button>
        </div>
      </div>
    </main>
  )
}
