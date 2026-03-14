'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'
import { formatPrice } from '@/lib/products'

interface RitualProduct {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
}

export default function SelectTokenPage() {
  const router = useRouter()
  const [products, setProducts] = useState<RitualProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [preselectedId, setPreselectedId] = useState<string | null>(null)

  useEffect(() => {
    const storedProduct = localStorage.getItem('ntt_selected_product')
    if (storedProduct) {
      setPreselectedId(storedProduct)
      setSelectedId(storedProduct)
    }

    async function loadRitualProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data.success && data.products?.length > 0) {
          const ritual = data.products.filter((p: any) => p.product_type === 'ritual')
          setProducts(ritual)

          if (storedProduct) {
            const found = ritual.find((p: RitualProduct) => p.id === storedProduct)
            if (found) {
              setSelectedId(found.id)
            } else if (ritual.length > 0) {
              setSelectedId(ritual[0].id)
            }
          }
        }
      } catch {
        console.error('Failed to load ritual products')
      } finally {
        setLoading(false)
      }
    }
    loadRitualProducts()
  }, [])

  function handleContinue() {
    if (!selectedId) return
    const product = products.find(p => p.id === selectedId)
    if (!product) return
    localStorage.setItem('ntt_selected_product', product.id)
    localStorage.setItem('ntt_flow', 'ritual')
    router.push('/checkout?flow=ritual')
  }

  const selectedProduct = products.find(p => p.id === selectedId)

  return (
    <>
      <PageHero
        pretitle="Chọn vật chứng cho lời thề"
        title="Lời thề cần một vật chứng"
        subtitle="Cách bạn lưu giữ khoảnh khắc này sẽ tồn tại mãi."
      />

      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-[#D4AF37]/10">
              <p className="text-[#8A7D65]">Hiện chưa có vật chứng nào.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${products.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-6 lg:gap-8`}>
              {products.map((product, i) => {
                const isSelected = selectedId === product.id
                const isPreselected = preselectedId === product.id
                return (
                  <FadeInSection key={product.id} delay={i * 200}>
                    <button
                      onClick={() => setSelectedId(product.id)}
                      className="group relative w-full text-left flex flex-col transition-all duration-700 cursor-pointer overflow-hidden"
                      style={{
                        border: isSelected
                          ? '1px solid rgba(212,175,55,0.5)'
                          : '1px solid rgba(42,37,32,0.8)',
                        background: isSelected
                          ? 'rgba(212,175,55,0.04)'
                          : 'rgba(13,11,9,0.6)',
                        boxShadow: isSelected
                          ? '0 0 50px rgba(212,175,55,0.1), inset 0 0 30px rgba(212,175,55,0.03)'
                          : 'none',
                      }}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <Image
                          src={product.image_url || '/images/product-1.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 60%)',
                          }}
                        />
                        <div
                          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(to top, rgba(15,13,10,0.95), transparent)'
                              : 'linear-gradient(to top, rgba(13,11,9,0.95), transparent)',
                          }}
                        />
                        {isSelected && (
                          <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center bg-[#D4AF37]">
                            <Check className="h-5 w-5" style={{ color: '#0a0a08' }} />
                          </div>
                        )}
                        {isPreselected && !isSelected && (
                          <div className="absolute top-4 left-4 px-2 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/30">
                            <span className="text-[9px] tracking-[0.15em] uppercase text-[#D4AF37]">Đã chọn trước</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col flex-1 p-6 lg:p-8">
                        {product.category && (
                          <p
                            className="text-xs tracking-[0.3em] uppercase mb-3"
                            style={{ color: '#C5A55A' }}
                          >
                            {product.category}
                          </p>
                        )}

                        <h3
                          className="text-xl lg:text-2xl font-display font-light mb-4 transition-colors duration-500"
                          style={{ color: isSelected ? '#F5E6C8' : '#C5A55A' }}
                        >
                          {product.name}
                        </h3>

                        <p
                          className="text-sm leading-relaxed mb-6 flex-1"
                          style={{ color: '#8A7D65' }}
                        >
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                          <span
                            className="text-lg font-display tracking-wide"
                            style={{ color: isSelected ? '#D4AF37' : '#6B5F4A' }}
                          >
                            {formatPrice(product.price)}
                          </span>
                          <span
                            className="text-xs tracking-[0.2em] uppercase transition-colors duration-500"
                            style={{ color: isSelected ? '#D4AF37' : '#555040' }}
                          >
                            {isSelected ? 'Đã chọn' : 'Chọn vật chứng này'}
                          </span>
                        </div>
                      </div>
                    </button>
                  </FadeInSection>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-24 md:pb-32">
        <FadeInSection>
          <div className="mx-auto max-w-xl text-center">
            <GoldDivider className="mb-12" />

            <p
              className="text-lg md:text-xl font-display italic leading-relaxed mb-10"
              style={{ color: '#8A7D65' }}
            >
              {'Lựa chọn này sẽ đi cùng lời thề của bạn.'}
            </p>

            <button
              onClick={handleContinue}
              disabled={!selectedId}
              className={`w-full max-w-md mx-auto py-5 flex items-center justify-center gap-3 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-700 cursor-pointer ${
                selectedId
                  ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:shadow-[0_0_60px_rgba(212,175,55,0.25)]'
                  : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
              }`}
            >
              {selectedProduct ? `Tiếp tục với ${selectedProduct.name}` : 'Tiếp tục hoàn tất lời thề'}
              {selectedId && <ArrowRight className="h-4 w-4" />}
            </button>

            {!selectedId && (
              <p className="mt-4 text-sm" style={{ color: '#6B5F4A' }}>
                {'Hãy chọn một vật chứng để tiếp tục'}
              </p>
            )}
          </div>
        </FadeInSection>
      </section>
    </>
  )
}
