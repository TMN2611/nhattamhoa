'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FadeInSection, GoldDivider } from '@/components/shared-ui'

const reflectionQuestions = [
  'Bạn đang chọn vì khoảnh khắc hay vì con người?',
  'Nếu ngày mai mọi thứ thay đổi, bạn vẫn chọn người này?',
  'Bạn muốn tặng một món quà, hay trao một lời hứa?',
]

export default function ReadinessPage() {
  const router = useRouter()
  const [visibleQuestions, setVisibleQuestions] = useState(0)

  useEffect(() => {
    if (visibleQuestions < reflectionQuestions.length) {
      const timer = setTimeout(() => {
        setVisibleQuestions((prev) => prev + 1)
      }, 1800)
      return () => clearTimeout(timer)
    }
  }, [visibleQuestions])

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.03) 0%, transparent 60%)',
          }}
        />
        <FadeInSection>
          <p className="text-xs tracking-[0.4em] uppercase mb-8" style={{ color: '#C5A55A' }}>
            {'Một khoảnh khắc để suy ngẫm'}
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display text-balance"
            style={{ color: '#F5E6C8' }}
          >
            {'Không phải ai cũng nên trao lời thề'}
          </h1>
          <p
            className="mx-auto mt-8 max-w-lg text-lg md:text-xl leading-relaxed"
            style={{ color: '#8A7D65' }}
          >
            {'Một lời hứa vĩnh viễn không dành cho những cảm xúc tạm thời.'}
          </p>
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>

      {/* Section 1: Reflection questions */}
      <section className="px-6 py-20 md:py-28">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2
              className="text-2xl md:text-3xl font-light font-display text-balance"
              style={{ color: '#F5E6C8' }}
            >
              {'Hãy tự hỏi mình'}
            </h2>
          </div>
        </FadeInSection>

        <div className="mx-auto max-w-2xl flex flex-col gap-10">
          {reflectionQuestions.map((question, i) => (
            <div
              key={i}
              className="text-center transition-all duration-[1500ms] ease-out"
              style={{
                opacity: i < visibleQuestions ? 1 : 0,
                transform: i < visibleQuestions ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              <p
                className="text-xl md:text-2xl font-display font-light italic leading-relaxed"
                style={{ color: '#C5A55A' }}
              >
                {question}
              </p>
              {i < reflectionQuestions.length - 1 && (
                <div
                  className="mx-auto mt-10 h-px w-16"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Emotional Divider Quote */}
      <section className="px-6 py-16 md:py-24 text-center">
        <FadeInSection>
          <GoldDivider className="mb-12" />
          <p
            className="text-xl md:text-2xl lg:text-3xl font-light italic font-display leading-relaxed max-w-2xl mx-auto"
            style={{ color: '#D4AF37' }}
          >
            {'Không phải ai cũng sẵn sàng. Và điều đó hoàn toàn ổn.'}
          </p>
          <GoldDivider className="mt-12" />
        </FadeInSection>
      </section>

      {/* Section 3: Decision */}
      <section className="px-6 py-20 md:py-28">
        <FadeInSection>
          <div className="mx-auto max-w-xl">
            <div className="flex flex-col gap-6">
              {/* Button 1: Not ready */}
              <Link
                href="/"
                className="group block w-full p-8 border text-center transition-all duration-500 hover:border-[#555040]"
                style={{
                  borderColor: 'rgba(212,175,55,0.1)',
                  background: 'rgba(10,10,8,0.6)',
                }}
              >
                <p
                  className="text-xl md:text-2xl font-display font-light"
                  style={{ color: '#8A7D65' }}
                >
                  {'Chưa phải lúc này'}
                </p>
                <p
                  className="mt-3 text-base leading-relaxed"
                  style={{ color: '#6B5F4A' }}
                >
                  {'Hãy quay lại khi bạn chắc chắn.'}
                </p>
              </Link>

              {/* Button 2: Ready */}
              <button
                onClick={() => router.push('/khoanh-khac')}
                className="group w-full p-8 text-center transition-all duration-700 cursor-pointer bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] shadow-[0_0_40px_rgba(212,175,55,0.1)] hover:shadow-[0_0_60px_rgba(212,175,55,0.2)]"
              >
                <p
                  className="text-xl md:text-2xl font-display font-light"
                  style={{ color: '#0a0a08' }}
                >
                  {'Tôi đã sẵn sàng'}
                </p>
                <p
                  className="mt-3 text-base leading-relaxed"
                  style={{ color: 'rgba(10,10,8,0.7)' }}
                >
                  {'Tiến vào Nghi Thức'}
                </p>
              </button>
            </div>
          </div>
        </FadeInSection>
      </section>
    </>
  )
}
