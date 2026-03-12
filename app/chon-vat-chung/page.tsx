'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, ArrowRight } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'
import { useCart } from '@/lib/cart-context'
import { products, formatPrice } from '@/lib/products'

const tiers = [
  {
    id: 'tier-1',
    productId: 'hoa-vinh-cuu-do',
    title: 'Lưu giữ tinh giản',
    tagline: 'Khoảnh khắc thuần khiết nhất',
    description:
      'Một bông hồng đỏ thắm duy nhất, được bảo tồn trong sự tĩnh lặng. Không cần thêm gì — bởi tình yêu đích thực không cần trang sức.',
    image: '/images/tier-1-single-rose.jpg',
    price: 2500000,
  },
  {
    id: 'tier-2',
    productId: 'hoa-trai-tim',
    title: 'Lưu giữ cổ điển',
    tagline: 'Một nghi thức truyền thống',
    description:
      'Hồng nhung burgundy nằm trong hộp nhung đen, điểm vàng lá. Một nghi thức trao gửi đã tồn tại qua nhiều thế hệ, nay được giữ lại mãi mãi.',
    image: '/images/tier-2-box-rose.jpg',
    price: 3500000,
  },
  {
    id: 'tier-3',
    productId: 'hoa-dome-hong',
    title: 'Lưu giữ vĩnh cửu',
    tagline: 'Một biểu tượng không phai',
    description:
      'Bông hồng trong lồng kính pha lê — như câu chuyện Hoàng Tử Bé. Một vật chứng sống mãi với thời gian, bất chấp mọi thay đổi.',
    image: '/images/tier-3-dome-rose.jpg',
    price: 3200000,
  },
]

export default function SelectTokenPage() {
  const router = useRouter()
  const { addToCart, recipientName } = useCart()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  function handleContinue() {
    if (!selectedTier) return
    const tier = tiers.find((t) => t.id === selectedTier)
    if (!tier) return
    const product = products.find((p) => p.id === tier.productId)
    if (!product) return
    addToCart(product, recipientName || '')
    localStorage.setItem('ntt_selected_product', product.id)
    localStorage.setItem('ntt_flow', 'ritual')
    router.push('/checkout?flow=ritual')
  }

  return (
    <>
      <PageHero
        pretitle="Chọn vật chứng cho lời thề"
        title="Lời thề cần một vật chứng"
        subtitle="Cách bạn lưu giữ khoảnh khắc này sẽ tồn tại mãi."
      />

      {/* Product tiers */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier, i) => {
              const isSelected = selectedTier === tier.id
              return (
                <FadeInSection key={tier.id} delay={i * 200}>
                  <button
                    onClick={() => setSelectedTier(tier.id)}
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
                    {/* Product image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image
                        src={tier.image}
                        alt={tier.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      {/* Soft spotlight overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 60%)',
                        }}
                      />
                      {/* Bottom fade to card */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(to top, rgba(15,13,10,0.95), transparent)'
                            : 'linear-gradient(to top, rgba(13,11,9,0.95), transparent)',
                        }}
                      />
                      {/* Selected checkmark */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center bg-[#D4AF37]">
                          <Check className="h-5 w-5" style={{ color: '#0a0a08' }} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-6 lg:p-8">
                      {/* Tagline */}
                      <p
                        className="text-xs tracking-[0.3em] uppercase mb-3"
                        style={{ color: '#C5A55A' }}
                      >
                        {tier.tagline}
                      </p>

                      {/* Title */}
                      <h3
                        className="text-xl lg:text-2xl font-display font-light mb-4 transition-colors duration-500"
                        style={{ color: isSelected ? '#F5E6C8' : '#C5A55A' }}
                      >
                        {tier.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="text-sm leading-relaxed mb-6 flex-1"
                        style={{ color: '#8A7D65' }}
                      >
                        {tier.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                        <span
                          className="text-lg font-display tracking-wide"
                          style={{ color: isSelected ? '#D4AF37' : '#6B5F4A' }}
                        >
                          {formatPrice(tier.price)}
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
        </div>
      </section>

      {/* Bottom CTA */}
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
              disabled={!selectedTier}
              className={`w-full max-w-md mx-auto py-5 flex items-center justify-center gap-3 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-700 cursor-pointer ${
                selectedTier
                  ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:shadow-[0_0_60px_rgba(212,175,55,0.25)]'
                  : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
              }`}
            >
              {'Tiếp tục hoàn tất lời thề'}
              {selectedTier && <ArrowRight className="h-4 w-4" />}
            </button>

            {!selectedTier && (
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
