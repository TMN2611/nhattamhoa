'use client'

import { MapPin } from 'lucide-react'
import { FadeInSection, GoldDivider } from '@/components/shared-ui'

const moments = [
  {
    city: 'Hà Nội',
    title: 'Lời cầu hôn mùa đông',
    description:
      'Giữa cơn gió lạnh tháng Mười Hai, anh quỳ xuống — không phải vì chuẩn bị sẵn, mà vì không thể chờ thêm được nữa. Có những lời hứa không cần thời điểm hoàn hảo.',
    season: 'Đông 2025',
  },
  {
    city: 'TP. Hồ Chí Minh',
    title: 'Kỷ niệm 7 năm',
    description:
      'Bảy năm không phải là một con số. Đó là bảy năm chọn cùng một người mỗi sáng thức dậy. Bảy năm của những cuộc cãi vã — và những lần chọn ở lại.',
    season: 'Xuân 2026',
  },
  {
    city: 'Đà Lạt',
    title: 'Lời xin lỗi sau chia xa',
    description:
      'Họ đã từng chia tay. Nhưng có những người, dù đi bao xa, vẫn quay về. Không phải vì quen thuộc. Mà vì biết rằng — không ai khác thay thế được.',
    season: 'Thu 2025',
  },
  {
    city: 'Đà Nẵng',
    title: 'Ngày cưới',
    description:
      'Không phải một đám cưới hoành tráng. Chỉ có hai người, một đóa hồng, và lời thề trước biển. Đôi khi, những điều thiêng liêng nhất lại đơn giản như thế.',
    season: 'Hè 2025',
  },
]

export default function MomentsGalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.04) 0%, transparent 70%)',
          }}
        />
        <FadeInSection>
          <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C5A55A' }}>
            {'Những câu chuyện có thật'}
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display text-balance"
            style={{ color: '#F5E6C8' }}
          >
            {'Những Khoảnh Khắc Đã Được Chọn'}
          </h1>
          <p
            className="mx-auto mt-8 max-w-lg text-lg md:text-xl leading-relaxed italic"
            style={{ color: '#C5A55A' }}
          >
            {'Họ không cần một dịp đặc biệt. Chỉ cần biết rằng họ sẽ không chọn ai khác.'}
          </p>
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>

      {/* Timeline Gallery */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-4xl">
          {moments.map((moment, i) => (
            <FadeInSection key={moment.city} delay={i * 200}>
              <div
                className={`relative flex flex-col ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-8 md:gap-16 items-start py-14 md:py-20`}
              >
                {/* City and season label */}
                <div className="flex-shrink-0 md:w-1/3">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-4 w-4" style={{ color: '#D4AF37' }} />
                    <span
                      className="text-sm tracking-[0.2em] uppercase"
                      style={{ color: '#D4AF37' }}
                    >
                      {moment.city}
                    </span>
                  </div>
                  <p
                    className="text-sm tracking-[0.2em] uppercase"
                    style={{ color: '#6B5F4A' }}
                  >
                    {moment.season}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2
                    className="text-2xl md:text-3xl font-display font-light mb-5"
                    style={{ color: '#F5E6C8' }}
                  >
                    {moment.title}
                  </h2>
                  <p
                    className="text-base md:text-lg leading-relaxed"
                    style={{ color: '#8A7D65' }}
                  >
                    {moment.description}
                  </p>
                </div>

                {/* Decorative corner element */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: i === 0 ? 'transparent' : 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
                  }}
                />
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 py-20 md:py-28 text-center">
        <FadeInSection>
          <GoldDivider className="mb-14" />
          <p
            className="text-xl md:text-2xl lg:text-3xl font-light italic font-display leading-relaxed max-w-xl mx-auto"
            style={{ color: '#D4AF37' }}
          >
            {'"Có lẽ khoảnh khắc tiếp theo... là của bạn."'}
          </p>
          <GoldDivider className="mt-14" />
        </FadeInSection>
      </section>
    </>
  )
}
