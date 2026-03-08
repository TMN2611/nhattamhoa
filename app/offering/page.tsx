'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { offeringPageText } from '@/content/ritualText'

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
    const product = offeringPageText.products.find(p => p.id === selected)
    localStorage.setItem('ntt_offering', product?.name || '')
    localStorage.setItem('ntt_ritual_step', 'offering')
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center px-6 py-20">
      <div className={`max-w-3xl w-full text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-6">
          {offeringPageText.label}
        </p>

        <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display leading-tight mb-4">
          {offeringPageText.title}
        </h1>

        <p className="text-[#8A7D65] leading-relaxed mb-12 text-base">
          {offeringPageText.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {offeringPageText.products.map((product) => {
            const isSelected = selected === product.id
            return (
              <button
                key={product.id}
                onClick={() => setSelected(product.id)}
                className={`group relative p-8 border text-left transition-all duration-500 hover:translate-y-[-4px] ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_40px_rgba(212,175,55,0.15)]'
                    : 'border-[#D4AF37]/20 bg-[#0d0b09] hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)]'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-500 ${
                  isSelected ? 'bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent' : 'bg-transparent'
                }`} />

                <h3 className={`text-base tracking-wider font-medium mb-4 transition-colors ${
                  isSelected ? 'text-[#D4AF37]' : 'text-[#C5A55A] group-hover:text-[#D4AF37]'
                }`}>
                  {product.name}
                </h3>

                <p className="text-xs text-[#8A7D65] leading-relaxed whitespace-pre-line mb-6">
                  {product.description}
                </p>

                <div className="h-px w-12 bg-gradient-to-r from-[#D4AF37]/40 to-transparent mb-4" />

                <p className={`text-lg font-display transition-colors ${
                  isSelected ? 'text-[#F5E6C8]' : 'text-[#C5A55A]'
                }`}>
                  {product.price}
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
          {offeringPageText.button}
        </button>
      </div>
    </main>
  )
}
