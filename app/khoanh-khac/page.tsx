'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FadeInSection, GoldDivider } from '@/components/shared-ui'

const commitments = [
  {
    giver: 'Minh',
    receiver: 'Lan',
    date: '14.02.2026',
    vow: 'Anh chọn em. Không phải hôm nay. Mà là mãi mãi.',
  },
  {
    giver: 'Hoàng',
    receiver: 'Mai',
    date: '20.10.2025',
    vow: 'Giữa vạn người, anh chỉ nhìn thấy duy nhất một sự tồn tại.',
  },
  {
    giver: 'Quốc',
    receiver: 'An',
    date: '01.01.2026',
    vow: 'Lời thề này không có ngày hết hạn.',
  },
  {
    giver: 'Đức',
    receiver: 'Thảo',
    date: '12.12.2025',
    vow: 'Cảm ơn em đã cho anh lý do để dừng lại và cam kết.',
  },
  {
    giver: 'Sơn',
    receiver: 'Hà',
    date: '15.05.2025',
    vow: 'Tình yêu là một quyết định, và anh đã quyết định xong rồi.',
  },
  {
    giver: 'Nam',
    receiver: 'Linh',
    date: '08.03.2026',
    vow: 'Bông hoa này tàn phai, nhưng lời hứa của anh thì không.',
  },
]

export default function ChosenMomentsPage() {
  const router = useRouter()
  
  return (
    <main className="min-h-screen bg-black text-[#F5E6C8] selection:bg-[#D4AF37]/30">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.05) 0%, transparent 70%)',
          }}
        />
        <FadeInSection>
          <p
            className="text-xs tracking-[0.4em] uppercase mb-6"
            style={{ color: '#C5A55A' }}
          >
            {'Khoảnh khắc đã chọn'}
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display text-balance"
            style={{ color: '#F5E6C8' }}
          >
            {'Những Lời Thề Đã Được Trao'}
          </h1>
          <p
            className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed"
            style={{ color: '#8A7D65' }}
          >
            {'Không phải ai cũng chọn. Nhưng những người đã chọn — họ không bao giờ quay lại.'}
          </p>
          <GoldDivider className="mt-12 opacity-50" />
        </FadeInSection>
      </section>

      {/* Commitment Grid */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {commitments.map((item, i) => (
            <FadeInSection key={i} delay={i * 100}>
              <div
                className="group relative p-8 border border-[#D4AF37]/10 bg-[#0A0A08] transition-all duration-700 hover:border-[#D4AF37]/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(212,175,55,0.02)'
                }}
              >
                {/* Top: names and date */}
                <div className="relative flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-lg font-display font-medium text-[#F5E6C8]"
                    >
                      {item.giver}
                    </span>
                    <Heart
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: '#D4AF37', fill: '#D4AF37', opacity: 0.5 }}
                    />
                    <span
                      className="text-lg font-display font-medium text-[#F5E6C8]"
                    >
                      {item.receiver}
                    </span>
                  </div>
                  <span
                    className="text-xs tracking-wider text-[#555040]"
                  >
                    {item.date}
                  </span>
                </div>

                {/* Vow */}
                <p
                  className="text-base leading-relaxed italic font-display text-[#8A7D65] group-hover:text-[#C5A55A] transition-colors duration-500"
                >
                  &ldquo;{item.vow}&rdquo;
                </p>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-colors duration-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-colors duration-500" />
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-32 px-6 text-center">
        <FadeInSection>
          <GoldDivider className="mb-16 opacity-30" />
          <p className="text-xl md:text-2xl font-display italic text-[#C5A55A] mb-12">
            "Mỗi lời thề là một quyết định không thể thay đổi."
          </p>
          
          <button
            onClick={() => router.push('/nghi-thuc')}
            className="px-12 py-5 text-sm tracking-[0.3em] uppercase font-medium border border-[#D4AF37]/40 text-[#D4AF37] transition-all duration-700 hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] bg-transparent"
          >
            I am ready to choose
          </button>
        </FadeInSection>
      </section>
    </main>
  )
}
