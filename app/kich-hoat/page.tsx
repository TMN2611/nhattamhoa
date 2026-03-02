'use client'

import { useState } from 'react'
import { Calendar, MessageSquareHeart, Sparkles, ShieldCheck } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

export default function ActivationPage() {
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [activated, setActivated] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const canActivate = date.length > 0 && message.trim().length > 0

  function handleActivate() {
    if (!canActivate) return
    setIsAnimating(true)
    setTimeout(() => setActivated(true), 600)
  }

  if (activated) {
    return (
      <>
        <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-6">
          <FadeInSection>
            <div className="mx-auto max-w-lg text-center">
              {/* Success icon */}
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center border"
                style={{ borderColor: '#D4AF37' }}
              >
                <ShieldCheck className="h-9 w-9" style={{ color: '#D4AF37' }} />
              </div>

              <p
                className="mt-8 text-xs tracking-[0.4em] uppercase"
                style={{ color: '#D4AF37' }}
              >
                {'Kích hoạt thành công'}
              </p>

              <h1
                className="mt-4 text-3xl md:text-4xl font-display font-light"
                style={{ color: '#F5E6C8' }}
              >
                {'Lời thề của bạn đã sống'}
              </h1>

              <GoldDivider className="my-10" />

              <div
                className="border p-8 text-center"
                style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.02)' }}
              >
                <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#C5A55A' }}>
                  {'Ngày kích hoạt'}
                </p>
                <p className="text-xl font-display" style={{ color: '#F5E6C8' }}>
                  {new Date(date).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>

                <div
                  className="my-6 mx-auto h-px w-24"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }}
                />

                <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: '#C5A55A' }}>
                  {'Thông điệp'}
                </p>
                <p
                  className="text-lg italic font-display leading-relaxed"
                  style={{ color: '#F5E6C8' }}
                >
                  {`"${message}"`}
                </p>
              </div>

              <p className="mt-8 text-sm" style={{ color: '#6B5F4A' }}>
                {'Chứng thư của bạn đã được cập nhật với ngày kích hoạt và thông điệp này.'}
              </p>
            </div>
          </FadeInSection>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero
        pretitle="Khoảnh khắc thiêng liêng"
        title="Kích Hoạt Lời Thề"
        subtitle="Chọn ngày đặc biệt và gửi lời nhắn từ trái tim bạn. Lời thề sẽ sống từ khoảnh khắc này."
      />

      <section className="px-6 pb-24 md:pb-32">
        <div
          className={`mx-auto max-w-lg transition-all duration-600 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <FadeInSection>
            <div className="flex flex-col gap-6">
              {/* Date input */}
              <div>
                <label
                  htmlFor="activation-date"
                  className="flex items-center gap-2 text-sm mb-2 tracking-wide"
                  style={{ color: '#C5A55A' }}
                >
                  <Calendar className="h-4 w-4" />
                  {'Ngày kích hoạt'}
                </label>
                <input
                  id="activation-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border px-4 py-3.5 font-serif text-base focus:outline-none transition-colors"
                  style={{
                    borderColor: 'rgba(212,175,55,0.2)',
                    background: '#0d0b09',
                    color: '#F5E6C8',
                    colorScheme: 'dark',
                  }}
                />
                <p className="mt-2 text-sm" style={{ color: '#6B5F4A' }}>
                  {'Có thể là hôm nay, ngày kỷ niệm, hoặc bất kỳ ngày nào có ý nghĩa với bạn.'}
                </p>
              </div>

              {/* Message input */}
              <div>
                <label
                  htmlFor="activation-message"
                  className="flex items-center gap-2 text-sm mb-2 tracking-wide"
                  style={{ color: '#C5A55A' }}
                >
                  <MessageSquareHeart className="h-4 w-4" />
                  {'Thông điệp'}
                </label>
                <div
                  className="border p-1"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', background: '#0d0b09' }}
                >
                  <textarea
                    id="activation-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Viết những lời bạn muốn gửi kèm lời thề..."
                    rows={5}
                    className="w-full bg-transparent px-3 py-2 resize-none focus:outline-none italic leading-8 font-serif text-base"
                    style={{ color: '#F5E6C8' }}
                  />
                </div>
              </div>

              <GoldDivider className="my-4" />

              {/* Activate button */}
              <button
                onClick={handleActivate}
                disabled={!canActivate}
                className={`w-full py-5 flex items-center justify-center gap-3 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-700 cursor-pointer ${
                  canActivate
                    ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] shadow-[0_0_40px_rgba(212,175,55,0.15)]'
                    : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                {'Kích hoạt'}
              </button>

              {!canActivate && (
                <p className="text-center text-sm" style={{ color: '#6B5F4A' }}>
                  {'Vui lòng chọn ngày và nhập thông điệp để tiếp tục'}
                </p>
              )}
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
