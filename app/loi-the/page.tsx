'use client'

import { MapPin } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

const vows = [
  { year: '2026', city: 'Hà Nội', month: 'Tháng 1' },
  { year: '2026', city: 'TP. Hồ Chí Minh', month: 'Tháng 1' },
  { year: '2026', city: 'Đà Nẵng', month: 'Tháng 2' },
  { year: '2026', city: 'Hà Nội', month: 'Tháng 2' },
  { year: '2026', city: 'Cần Thơ', month: 'Tháng 2' },
  { year: '2026', city: 'TP. Hồ Chí Minh', month: 'Tháng 3' },
  { year: '2026', city: 'Huế', month: 'Tháng 3' },
  { year: '2026', city: 'Đà Lạt', month: 'Tháng 3' },
]

export default function VowTimelinePage() {
  return (
    <>
      <PageHero
        pretitle="Những lời thề đã được trao"
        title="Những Lời Thề Đã Được Trao"
        subtitle="Mỗi dòng là một lời hứa. Ẩn danh. Vĩnh cửu. Thiêng liêng."
      />

      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-lg">
          {/* Timeline line */}
          <div className="relative">
            {/* Vertical gold line */}
            <div
              className="absolute left-[23px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(180deg, transparent, #D4AF37 10%, #D4AF37 90%, transparent)' }}
            />

            <div className="flex flex-col gap-0">
              {vows.map((vow, i) => (
                <FadeInSection key={`${vow.city}-${i}`} delay={i * 120}>
                  <div className="relative flex items-start gap-6 py-6">
                    {/* Dot on timeline */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className="flex h-12 w-12 items-center justify-center"
                        style={{
                          background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
                        }}
                      >
                        <div
                          className="h-3 w-3 rotate-45"
                          style={{ background: '#D4AF37' }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <div className="flex items-center gap-3 mb-1">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                        <span
                          className="text-lg md:text-xl font-display"
                          style={{ color: '#F5E6C8' }}
                        >
                          {vow.city}
                        </span>
                      </div>
                      <p className="text-sm tracking-[0.2em] uppercase" style={{ color: '#6B5F4A' }}>
                        {`${vow.month} ${vow.year}`}
                      </p>
                    </div>

                    {/* Right whisper text */}
                    <span
                      className="hidden md:block pt-3 text-sm italic"
                      style={{ color: '#6B5F4A' }}
                    >
                      {'Một lời thề đã được ghi nhận'}
                    </span>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>

          {/* Closing */}
          <FadeInSection delay={1000}>
            <div className="mt-14 text-center">
              <GoldDivider className="mb-10" />
              <p className="text-sm" style={{ color: '#6B5F4A' }}>
                {'Và còn nhiều lời thề khác đang chờ được viết...'}
              </p>
              <p
                className="mt-4 text-base italic font-display"
                style={{ color: '#D4AF37' }}
              >
                {'"Có lẽ lời thề tiếp theo là của bạn."'}
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
