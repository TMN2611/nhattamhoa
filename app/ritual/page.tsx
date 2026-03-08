'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ritualPageText } from '@/content/ritualText'

export default function RitualPage() {
  const router = useRouter()
  const [commitments, setCommitments] = useState<boolean[]>(
    ritualPageText.commitments.map(() => false)
  )
  const [visible, setVisible] = useState(false)
  const [itemsVisible, setItemsVisible] = useState<boolean[]>(
    ritualPageText.commitments.map(() => false)
  )

  useEffect(() => {
    const step = localStorage.getItem('ntt_ritual_step')
    if (step !== 'moment') {
      router.push('/ready')
      return
    }
    setTimeout(() => setVisible(true), 100)

    ritualPageText.commitments.forEach((_, i) => {
      setTimeout(() => {
        setItemsVisible(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, 600 + i * 400)
    })
  }, [router])

  function toggleCommitment(index: number) {
    setCommitments(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  const allChecked = commitments.every(Boolean)

  function handleContinue() {
    if (!allChecked) return
    localStorage.setItem('ntt_ritual_type', 'Lời Thề Vĩnh Cửu')
    localStorage.setItem('ntt_ritual_step', 'ritual')
    router.push('/offering')
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6 py-20">
      <div className={`max-w-2xl w-full text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          {ritualPageText.label}
        </p>

        <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display leading-tight mb-4">
          {ritualPageText.title}
        </h1>

        <div className="text-[#8A7D65] leading-relaxed mb-10 whitespace-pre-line text-base">
          {ritualPageText.subtitle}
        </div>

        <div className="text-left max-w-lg mx-auto mb-8">
          <div className="text-[#C5A55A]/80 leading-loose whitespace-pre-line text-sm md:text-base italic">
            {ritualPageText.body}
          </div>
        </div>

        <div className="mb-10 p-6 border border-[#D4AF37]/30 bg-[#D4AF37]/5">
          <p className="text-lg md:text-xl text-[#D4AF37] italic font-display">
            &ldquo;{ritualPageText.highlight}&rdquo;
          </p>
        </div>

        <div className="space-y-4 mb-10 max-w-lg mx-auto">
          {ritualPageText.commitments.map((text, i) => (
            <label
              key={i}
              className={`flex items-start gap-4 p-4 border cursor-pointer text-left transition-all duration-700 ${
                itemsVisible[i] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              } ${
                commitments[i]
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-[#D4AF37]/20 bg-[#0d0b09] hover:border-[#D4AF37]/40'
              }`}
            >
              <div className={`mt-0.5 h-5 w-5 flex-shrink-0 border transition-all duration-300 flex items-center justify-center ${
                commitments[i] ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#D4AF37]/40'
              }`}>
                {commitments[i] && (
                  <svg className="h-3 w-3 text-[#0a0a08]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={commitments[i]}
                onChange={() => toggleCommitment(i)}
                className="sr-only"
              />
              <span className={`text-sm leading-relaxed transition-colors ${
                commitments[i] ? 'text-[#F5E6C8]' : 'text-[#C5A55A]/80'
              }`}>
                {text}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!allChecked}
          className={`px-12 py-4 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 ${
            allChecked
              ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]'
              : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
          }`}
        >
          {ritualPageText.button}
        </button>
      </div>
    </main>
  )
}
