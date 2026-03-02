'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { FadeInSection, GoldDivider } from '@/components/shared-ui'

const commitments = [
  {
    giver: 'Minh',
    receiver: 'Lan',
    date: '14.02.2026',
    vow: 'Anh chọn em. Không phải hôm nay. Mà là mãi mãi.',
  },
  {
    giver: 'Tuấn',
    receiver: 'Hà',
    date: '01.01.2026',
    vow: 'Mỗi ngày anh thức dậy, điều đầu tiên anh nghĩ tới — vẫn là em.',
  },
  {
    giver: 'Khang',
    receiver: 'Thy',
    date: '20.10.2025',
    vow: 'Anh không hứa sẽ hoàn hảo. Nhưng anh hứa sẽ không bao giờ bỏ đi.',
  },
  {
    giver: 'Hưng',
    receiver: 'Mai',
    date: '08.03.2026',
    vow: 'Em là lý do duy nhất anh tin vào hai chữ "mãi mãi".',
  },
  {
    giver: 'Bảo',
    receiver: 'Ngọc',
    date: '25.12.2025',
    vow: 'Trong hàng triệu người, anh đã chọn em — và anh sẽ chọn lại nếu được sống thêm lần nữa.',
  },
  {
    giver: 'Đức',
    receiver: 'Linh',
    date: '14.09.2025',
    vow: 'Nếu tình yêu là một lời thề, thì em là lời thề đẹp nhất đời anh.',
  },
  {
    giver: 'Phong',
    receiver: 'Uyên',
    date: '22.11.2025',
    vow: 'Anh không biết tương lai ra sao. Nhưng anh biết — có em trong đó.',
  },
  {
    giver: 'Thành',
    receiver: 'Trinh',
    date: '05.02.2026',
    vow: 'Có người hỏi anh sợ gì nhất. Anh nói: mất em.',
  },
]

export default function ChosenMomentsPage() {
  return (
    <>
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
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>

      {/* Commitment Grid */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
          {commitments.map((item, i) => (
            <FadeInSection key={`${item.giver}-${item.receiver}`} delay={i * 120}>
              <div
                className="group relative p-7 md:p-9 rounded-sm transition-all duration-700 hover:scale-[1.02]"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(30,27,22,0.9) 0%, rgba(20,18,14,0.95) 100%)',
                  border: '1px solid rgba(212,175,55,0.12)',
                  boxShadow: '0 0 30px rgba(212,175,55,0.03)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    boxShadow:
                      'inset 0 0 40px rgba(212,175,55,0.06), 0 0 60px rgba(212,175,55,0.04)',
                  }}
                />

                {/* Top: names and date */}
                <div className="relative flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-lg md:text-xl font-display font-medium"
                      style={{ color: '#F5E6C8' }}
                    >
                      {item.giver}
                    </span>
                    <Heart
                      className="h-3.5 w-3.5 flex-shrink-0"
                      style={{ color: '#D4AF37', fill: '#D4AF37', opacity: 0.5 }}
                    />
                    <span
                      className="text-lg md:text-xl font-display font-medium"
                      style={{ color: '#F5E6C8' }}
                    >
                      {item.receiver}
                    </span>
                  </div>
                  <span
                    className="text-sm tracking-wider"
                    style={{ color: '#6B5F4A' }}
                  >
                    {item.date}
                  </span>
                </div>

                {/* Thin divider */}
                <div
                  className="h-px w-full mb-5"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                  }}
                />

                {/* Commitment label */}
                <p
                  className="text-xs tracking-[0.25em] uppercase mb-3"
                  style={{ color: '#C5A55A' }}
                >
                  {`${item.giver} đã chọn ${item.receiver}`}
                </p>

                {/* Vow */}
                <p
                  className="text-base md:text-lg leading-relaxed italic font-display"
                  style={{ color: '#C5A55A', opacity: 0.85 }}
                >
                  {`"${item.vow}"`}
                </p>

                {/* Corner accents */}
                <div
                  className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                  style={{
                    borderTop: '1px solid rgba(212,175,55,0.25)',
                    borderLeft: '1px solid rgba(212,175,55,0.25)',
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 w-5 h-5 pointer-events-none"
                  style={{
                    borderBottom: '1px solid rgba(212,175,55,0.25)',
                    borderRight: '1px solid rgba(212,175,55,0.25)',
                  }}
                />
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Closing statement */}
      <section className="px-6 py-20 md:py-28 text-center">
        <FadeInSection>
          <GoldDivider className="mb-14" />
          <p
            className="text-xl md:text-2xl lg:text-3xl font-light italic font-display leading-relaxed max-w-2xl mx-auto text-balance"
            style={{ color: '#D4AF37' }}
          >
            {'"Mỗi lời thề là một quyết định không thể thay đổi."'}
          </p>
          <GoldDivider className="mt-14 mb-14" />

          {/* CTA */}
          <Link
            href="/nghi-thuc"
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-sm text-sm tracking-[0.2em] uppercase font-display transition-all duration-500 hover:scale-105"
            style={{
              color: '#D4AF37',
              border: '1px solid rgba(212,175,55,0.4)',
              background: 'transparent',
            }}
          >
            <span
              className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow:
                  '0 0 30px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05)',
              }}
            />
            <span className="relative">{'I am ready to choose'}</span>
          </Link>
        </FadeInSection>
      </section>
    </>
  )
}
