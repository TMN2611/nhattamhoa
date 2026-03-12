'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { offeringPageText } from '@/content/ritualText'

interface DBProduct {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category?: string
  is_permanent_available?: boolean
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(price) + 'đ'
}

export default function OfferingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [products, setProducts] = useState<DBProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [permanenceType, setPermanenceType] = useState<'temporary' | 'permanent'>('temporary')

  useEffect(() => {
    const step = localStorage.getItem('ntt_ritual_step')
    if (step !== 'ritual') {
      router.push('/ready')
      return
    }
    setTimeout(() => setVisible(true), 100)

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [router])

  const displayProducts = products.length > 0
    ? products
    : offeringPageText.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.priceNum,
        is_permanent_available: true,
      }))

  const selectedProduct = displayProducts.find(p => p.id === selected)
  const canSelectPermanent = selectedProduct?.is_permanent_available !== false

  function handleContinue() {
    if (!selected) return
    const product = displayProducts.find(p => p.id === selected)
    localStorage.setItem('ntt_offering', product?.name || '')
    localStorage.setItem('ntt_selected_product', selected)
    localStorage.setItem('ntt_permanence_type', permanenceType)
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

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {displayProducts.map((product) => {
              const isSelected = selected === product.id
              return (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelected(product.id)
                    if (product.is_permanent_available === false) {
                      setPermanenceType('temporary')
                    }
                  }}
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
                    {formatPrice(product.price)}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {selected && (
          <div className="mb-10 max-w-md mx-auto">
            <p className="text-xs tracking-[0.3em] uppercase text-[#C5A55A] mb-4">Loại cam kết</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPermanenceType('temporary')}
                className={`p-4 border text-center transition-all duration-300 ${
                  permanenceType === 'temporary'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5E6C8]'
                    : 'border-[#D4AF37]/20 bg-[#0d0b09] text-[#8A7D65] hover:border-[#D4AF37]/40'
                }`}
              >
                <p className="text-sm font-medium mb-1">Duyên Khởi</p>
                <p className="text-[10px] text-[#8A7D65]">Có thể chỉnh sửa sau</p>
              </button>
              <button
                onClick={() => canSelectPermanent && setPermanenceType('permanent')}
                disabled={!canSelectPermanent}
                className={`p-4 border text-center transition-all duration-300 ${
                  !canSelectPermanent
                    ? 'border-[#2a2520] bg-[#0d0b09] text-[#555040] cursor-not-allowed'
                    : permanenceType === 'permanent'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5E6C8]'
                      : 'border-[#D4AF37]/20 bg-[#0d0b09] text-[#8A7D65] hover:border-[#D4AF37]/40'
                }`}
              >
                <p className="text-sm font-medium mb-1">Thiên Niên</p>
                <p className="text-[10px] text-[#8A7D65]">
                  {canSelectPermanent ? 'Không thể thay đổi' : 'Không khả dụng'}
                </p>
              </button>
            </div>
          </div>
        )}

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
