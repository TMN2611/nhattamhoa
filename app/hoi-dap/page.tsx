'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

const faqs = [
  {
    question: 'Nếu chia tay thì sao?',
    answer:
      'Chứng Thư Nhất Tâm không thể thu hồi hay thay đổi. Đây là triết lý cốt lõi của thương hiệu: lời thề mang tính vĩnh viễn, giống như những quyết định quan trọng nhất trong đời. Chúng tôi tin rằng, chính sự không thể thay đổi này mới tạo nên giá trị thật sự của cam kết. Hãy cân nhắc thật kỹ trước khi đưa ra lời thề.',
  },
  {
    question: 'Có thể tặng người thân không?',
    answer:
      'Nhất Tâm Hoa được thiết kế dành cho tình yêu đôi lứa — một lời thề giữa hai người yêu nhau. Tuy nhiên, nếu bạn muốn dành tặng cho một người thân đặc biệt trong đời (cha mẹ, con cái), chúng tôi hoàn toàn tôn trọng điều đó. Miễn là lời thề đến từ trái tim và mang ý nghĩa trọn đời.',
  },
  {
    question: 'Lời thề có thể thay đổi không?',
    answer:
      'Không. Một khi lời thề đã được ghi nhận vào Chứng Thư Nhất Tâm, nó không thể chỉnh sửa, xóa bỏ hay thay thế. Đây không phải là hạn chế — đây là bản chất của sự cam kết. Giống như một lời hứa thật sự, nó chỉ có giá trị khi không thể rút lại.',
  },
  {
    question: 'Hoa hồng bảo tồn được bao lâu?',
    answer:
      'Hoa hồng Nhất Tâm được bảo tồn bằng quy trình đặc biệt, giữ nguyên vẻ đẹp tự nhiên trong nhiều năm mà không cần nước hay ánh sáng. Trong điều kiện bảo quản tốt (tránh ẩm, tránh ánh nắng trực tiếp), hoa có thể giữ được vẻ đẹp từ 3-5 năm hoặc lâu hơn.',
  },
  {
    question: 'Tôi có thể mua nhiều lần không?',
    answer:
      'Bạn hoàn toàn có thể mua hoa hồng Nhất Tâm nhiều lần. Tuy nhiên, tất cả các đơn hàng sau lần đầu tiên sẽ mặc định dành cho cùng một người đã được ghi trong Chứng Thư Nhất Tâm. Bạn không thể thay đổi người nhận.',
  },
  {
    question: 'Chứng thư có giá trị pháp lý không?',
    answer:
      'Chứng Thư Nhất Tâm không phải là một văn bản pháp lý. Đây là một biểu tượng tinh thần — một cam kết cá nhân mang tính thiêng liêng giữa bạn và người bạn yêu thương. Giá trị của nó nằm ở ý nghĩa, không phải ở luật pháp.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggleFAQ(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <>
      <PageHero
        pretitle="Giải đáp thắc mắc"
        title="Câu Hỏi Thường Gặp"
        subtitle="Những điều bạn cần biết trước khi đưa ra lời thề trọn đời."
      />

      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-2xl flex flex-col gap-0">
          {faqs.map((faq, i) => (
            <FadeInSection key={i} delay={i * 100}>
              <div
                className="border-b"
                style={{ borderColor: 'rgba(212,175,55,0.12)' }}
              >
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full flex items-center justify-between py-7 text-left cursor-pointer group"
                  aria-expanded={openIndex === i}
                >
                  <span
                    className="text-base md:text-lg font-display pr-4 transition-colors duration-300"
                    style={{ color: openIndex === i ? '#F5E6C8' : '#C5A55A' }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-500 ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                    style={{ color: '#D4AF37' }}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    openIndex === i ? 'max-h-96 opacity-100 pb-7' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{ color: '#8A7D65' }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* Closing */}
        <FadeInSection delay={700}>
          <div className="mx-auto max-w-xl mt-16 text-center">
            <GoldDivider className="mb-10" />
            <p
              className="text-lg md:text-xl italic font-display leading-relaxed"
              style={{ color: '#D4AF37' }}
            >
              {'"Nếu bạn còn phân vân, có lẽ bạn chưa sẵn sàng. Và điều đó hoàn toàn ổn."'}
            </p>
            <p className="mt-6 text-sm" style={{ color: '#6B5F4A' }}>
              {'Cần hỗ trợ thêm? Liên hệ với chúng tôi qua trang '}
              <a
                href="mailto:hello@nhattamhoa.com"
                className="underline underline-offset-4 transition-colors hover:text-[#D4AF37]"
                style={{ color: '#C5A55A' }}
              >
                {'email'}
              </a>
              {'.'}
            </p>
          </div>
        </FadeInSection>
      </section>
    </>
  )
}
