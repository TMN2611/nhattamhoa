'use client'

import { ScrollText, Lock, Infinity } from 'lucide-react'
import { FadeInSection, GoldDivider, PageHero } from '@/components/shared-ui'

const rules = [
  {
    icon: ScrollText,
    number: 'I',
    title: 'Mỗi khách hàng chỉ có thể tạo một lời thề duy nhất',
    text: 'Hệ thống Nhất Tâm chỉ cho phép một chứng thư cam kết cho mỗi người. Bạn không thể tạo lời thề thứ hai, dù cho bất kỳ lý do nào. Đây là quy tắc cốt lõi của thương hiệu.',
  },
  {
    icon: Lock,
    number: 'II',
    title: 'Lời thề không thể chỉnh sửa',
    text: 'Một khi tên người nhận đã được ghi vào Chứng Thư Nhất Tâm, nó không thể thay đổi, sửa chữa hay xóa bỏ. Giống như tình yêu thực sự — không có nút quay lại.',
  },
  {
    icon: Infinity,
    number: 'III',
    title: 'Chứng thư tồn tại vĩnh viễn',
    text: 'Chứng thư Nhất Tâm của bạn sẽ được lưu giữ vĩnh viễn trong hệ thống. Nó là minh chứng cho sự cam kết của bạn — hôm nay, ngày mai, và mãi mãi.',
  },
]

export default function VowRulesPage() {
  return (
    <>
      <PageHero
        pretitle="Quy ước thiêng liêng"
        title="Quy Ước Lời Thề"
        subtitle="Ba quy tắc bất biến của Nhất Tâm Hoa. Không ngoại lệ."
      />

      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-3xl flex flex-col gap-0">
          {rules.map((rule, i) => {
            const Icon = rule.icon
            return (
              <FadeInSection key={rule.number} delay={i * 200}>
                <div className="relative flex flex-col items-center text-center py-14 md:py-18">
                  <span className="text-5xl md:text-6xl font-display font-light text-gold">
                    {rule.number}
                  </span>

                  <div className="mt-6 flex h-14 w-14 items-center justify-center border border-gold text-gold">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>

                  <h2 className="mt-6 text-xl md:text-2xl font-display leading-snug text-balance text-foreground">
                    {rule.title}
                  </h2>

                  <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                    {rule.text}
                  </p>

                  {i < rules.length - 1 && (
                    <div className="mt-14">
                      <GoldDivider />
                    </div>
                  )}
                </div>
              </FadeInSection>
            )
          })}
        </div>

        <FadeInSection delay={700}>
          <div className="mx-auto max-w-xl mt-6 text-center">
            <GoldDivider className="mb-10" />
            <p className="text-lg md:text-xl italic font-display leading-relaxed text-gold">
              {'"Những quy tắc này không phải để hạn chế bạn. Chúng tồn tại để bảo vệ giá trị của lời thề."'}
            </p>
          </div>
        </FadeInSection>
      </section>
    </>
  )
}
