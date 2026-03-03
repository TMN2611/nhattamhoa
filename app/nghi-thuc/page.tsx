'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Shield } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

const commitments = [
  {
    id: 'permanent',
    label: 'Tôi hiểu rằng lựa chọn này mang ý nghĩa vĩnh viễn',
    description: 'Lời thề Nhất Tâm không thể rút lại hay thay đổi.',
  },
  {
    id: 'not-gift',
    label: 'Tôi hiểu rằng đây không chỉ là một món quà',
    description: 'Đây là biểu tượng của sự cam kết trọn đời.',
  },
  {
    id: 'voluntary',
    label: 'Tôi tự nguyện đưa ra quyết định này',
    description: 'Không ai ép buộc. Đây là sự lựa chọn từ trái tim.',
  },
]

export default function RitualPage() {
  const router = useRouter()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const allChecked = commitments.every((c) => checked[c.id])

  function toggleCommitment(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <PageHero
        pretitle="Nghi thức thiêng liêng"
        title="Nghi Thức Lựa Chọn"
        subtitle="Trước khi tiếp tục, bạn cần hiểu rằng đây không phải một giao dịch thông thường. Đây là một nghi thức cam kết."
      />

      <section className="px-6 pb-12">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base md:text-lg leading-relaxed" style={{ color: '#8A7D65' }}>
              {'Trong một thế giới mà lời hứa trở nên nhẹ bẫng, '}
              {'Nhất Tâm Hoa yêu cầu bạn dừng lại một nhịp. '}
              {'Hãy tự hỏi mình: người này có xứng đáng với lời thề trọn đời không?'}
            </p>
            <p
              className="mt-6 text-lg md:text-xl italic font-display"
              style={{ color: '#D4AF37' }}
            >
              {'"Nếu câu trả lời là có — hãy tiếp tục."'}
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* Commitment checkboxes */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-xl flex flex-col gap-5">
          {commitments.map((item, i) => (
            <FadeInSection key={item.id} delay={i * 150}>
              <button
                onClick={() => toggleCommitment(item.id)}
                className={`w-full text-left p-6 border transition-all duration-500 cursor-pointer group ${
                  checked[item.id]
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/[0.04]'
                    : 'border-[#2a2520] bg-[#0d0b09]/60 hover:border-[#D4AF37]/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center border transition-all duration-300 ${
                      checked[item.id]
                        ? 'bg-[#D4AF37] border-[#D4AF37]'
                        : 'border-[#555040] group-hover:border-[#C5A55A]'
                    }`}
                  >
                    {checked[item.id] && <Check className="h-4 w-4" style={{ color: '#0a0a08' }} />}
                  </div>
                  <div>
                    <p
                      className={`text-base md:text-lg font-display transition-colors duration-300 ${
                        checked[item.id] ? '' : ''
                      }`}
                      style={{ color: checked[item.id] ? '#F5E6C8' : '#C5A55A' }}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#6B5F4A' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            </FadeInSection>
          ))}
        </div>

        {/* Confirm button */}
        <FadeInSection delay={500}>
          <div className="mx-auto max-w-xl mt-10">
            <GoldDivider className="mb-10" />

            <button
              onClick={() => router.push('/chon-vat-chung')}
              disabled={!allChecked}
              className={`w-full py-5 flex items-center justify-center gap-3 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-700 cursor-pointer ${
                allChecked
                  ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] shadow-[0_0_40px_rgba(212,175,55,0.15)]'
                  : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
              }`}
            >
              <Shield className="h-4 w-4" />
              {'Tiếp tục nghi thức'}
            </button>

            {!allChecked && (
              <p className="mt-4 text-center text-sm" style={{ color: '#6B5F4A' }}>
                {'Vui lòng xác nhận tất cả cam kết để tiếp tục'}
              </p>
            )}
          </div>
        </FadeInSection>
      </section>
    </>
  )
}
