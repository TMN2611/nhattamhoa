'use client'

import { MapPin } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

const vows = [
  { year: '2026', city: 'Ha Noi', month: 'Thang 1' },
  { year: '2026', city: 'TP. Ho Chi Minh', month: 'Thang 1' },
  { year: '2026', city: 'Da Nang', month: 'Thang 2' },
  { year: '2026', city: 'Ha Noi', month: 'Thang 2' },
  { year: '2026', city: 'Can Tho', month: 'Thang 2' },
  { year: '2026', city: 'TP. Ho Chi Minh', month: 'Thang 3' },
  { year: '2026', city: 'Hue', month: 'Thang 3' },
  { year: '2026', city: 'Da Lat', month: 'Thang 3' },
]

export default function VowTimelinePage() {
  return (
    <>
      <PageHero
        pretitle="Nhung loi the da duoc trao"
        title="Nhung Loi The Da Duoc Trao"
        subtitle="Moi dong la mot loi hua. An danh. Vinh cuu. Thieng lieng."
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
                      <p className="text-xs tracking-[0.25em] uppercase" style={{ color: '#6B5F4A' }}>
                        {`${vow.month} ${vow.year}`}
                      </p>
                    </div>

                    {/* Right whisper text */}
                    <span
                      className="hidden md:block pt-3 text-xs italic"
                      style={{ color: '#3a3428' }}
                    >
                      {'Mot loi the da duoc ghi nhan'}
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
                {'Va con nhieu loi the khac dang cho duoc viet...'}
              </p>
              <p
                className="mt-4 text-base italic font-display"
                style={{ color: '#D4AF37' }}
              >
                {'"Co le loi the tiep theo la cua ban."'}
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
