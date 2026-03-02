'use client'

import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

function PhilosophySection({
  heading,
  children,
  delay = 0,
}: {
  heading: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <FadeInSection delay={delay}>
      <div className="text-center">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-light font-display leading-snug text-balance"
          style={{ color: '#F5E6C8' }}
        >
          {heading}
        </h2>
        <div className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed" style={{ color: '#8A7D65' }}>
          {children}
        </div>
      </div>
    </FadeInSection>
  )
}

export default function BrandStoryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-6 overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.03) 0%, transparent 70%)',
          }}
        />
        <FadeInSection>
          <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C5A55A' }}>
            {'Nhất Tâm Hoa'}
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display"
            style={{ color: '#F5E6C8' }}
          >
            {'Một đời. Một đóa. Một người.'}
          </h1>
          <p
            className="mx-auto mt-8 max-w-lg text-lg md:text-xl leading-relaxed italic"
            style={{ color: '#C5A55A' }}
          >
            {'Nhất Tâm Hoa không bán hoa. Chúng tôi tạo ra một lời hứa.'}
          </p>
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>

      {/* Section 1: Modern love critique */}
      <section className="px-6 pb-20 md:pb-28">
        <PhilosophySection heading="Tình yêu trong thời đại có thể thay thế">
          <p>
            {'Chúng ta sống trong một thế giới mà mọi thứ đều có thể thay thế. Điện thoại cũ đổi mới. Quần áo một mùa rồi bỏ. Và cả tình yêu '}
            {'cũng trở nên tạm bợ, dễ dàng bắt đầu và dễ dàng kết thúc.'}
          </p>
          <p className="mt-4">
            {'Người ta swipe phải, swipe trái. Người ta nói "yêu" rồi quên. Lời hứa không còn nặng nề, vì '}
            {'chẳng có gì bắt buộc phải giữ.'}
          </p>
        </PhilosophySection>
      </section>

      {/* Gold horizontal line */}
      <div className="mx-auto max-w-xs h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

      {/* Section 2: Belief */}
      <section className="px-6 py-20 md:py-28">
        <PhilosophySection heading="Niềm tin" delay={100}>
          <p>
            {'Nhưng chúng tôi tin rằng vẫn có những người sẵn sàng chọn chỉ một người trong suốt cuộc đời.'}
          </p>
          <p className="mt-4">
            {'Không phải vì sợ cô đơn. Không phải vì không có lựa chọn khác. '}
            {'Mà vì họ hiểu rằng, giá trị thật sự của tình yêu nằm ở sự lựa chọn có ý thức '}
            {'- chọn một người, và không bao giờ quay đầu.'}
          </p>
          <p
            className="mt-8 text-xl md:text-2xl italic font-display"
            style={{ color: '#D4AF37' }}
          >
            {'"Vì tình yêu đích thực không cần lựa chọn thứ hai."'}
          </p>
        </PhilosophySection>
      </section>

      {/* Gold horizontal line */}
      <div className="mx-auto max-w-xs h-px" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

      {/* Section 3: Meaning of a flower */}
      <section className="px-6 py-20 md:py-28">
        <FadeInSection delay={100}>
          <div className="text-center">
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-light font-display leading-snug text-balance"
              style={{ color: '#F5E6C8' }}
            >
              {'Ý nghĩa của một đóa hoa'}
            </h2>
            <p
              className="mx-auto mt-6 max-w-2xl text-base md:text-lg leading-relaxed"
              style={{ color: '#8A7D65' }}
            >
              {'Mỗi đóa hồng Nhất Tâm không chỉ là một bông hoa đẹp. Nó là hiện thân của ba điều thiêng liêng:'}
            </p>
          </div>
        </FadeInSection>

        <div className="mx-auto mt-14 max-w-3xl flex flex-col gap-10">
          {[
            {
              number: 'I',
              title: 'Sự lựa chọn có ý thức',
              text: 'Bạn không mua hoa vì thói quen. Bạn mua vì đã quyết định rằng người này xứng đáng với điều vĩnh cửu.',
            },
            {
              number: 'II',
              title: 'Sự trung thành với trái tim',
              text: 'Một khi đã chọn, bạn không thay đổi. Không vì hoàn cảnh, không vì thời gian. Chỉ một người duy nhất.',
            },
            {
              number: 'III',
              title: 'Sự dũng cảm để không quay đầu',
              text: 'Thế giới sẽ cám dỗ bạn bằng vô vàn lựa chọn khác. Nhưng bạn dũng cảm đứng vững với lời hứa của mình.',
            },
          ].map((item, i) => (
            <FadeInSection key={item.number} delay={i * 150}>
              <div className="flex gap-6 md:gap-10 items-start">
                <span
                  className="text-3xl md:text-4xl font-display flex-shrink-0 w-12 text-center"
                  style={{ color: '#D4AF37' }}
                >
                  {item.number}
                </span>
                <div>
                  <h3
                    className="text-lg md:text-xl font-display"
                    style={{ color: '#F5E6C8' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 leading-relaxed" style={{ color: '#8A7D65' }}>
                    {item.text}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Closing quote */}
      <section className="px-6 py-20 md:py-28 text-center">
        <FadeInSection>
          <GoldDivider className="mb-12" />
          <p
            className="text-xl md:text-2xl lg:text-3xl font-light italic font-display leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#D4AF37' }}
          >
            {'"Khi cả thế giới nói rằng tình yêu là tạm thời, hãy để Nhất Tâm Hoa nhắc bạn rằng — '}
            {'có những thứ đáng để giữ mãi."'}
          </p>
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>
    </>
  )
}
