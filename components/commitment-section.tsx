'use client'

import { useEffect, useRef, useState } from 'react'

export function CommitmentSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-border/30 bg-secondary/50"
    >
      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32 text-center">
        <div
          className={`transition-all duration-[1200ms] ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-sm tracking-[0.4em] uppercase text-gold-dim mb-6">
            The Commitment
          </p>
          <h2 className="text-3xl md:text-5xl font-light leading-snug text-foreground text-balance">
            {'Quy tắc "Chỉ Một Người"'}
          </h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-6 text-cream-dim leading-relaxed text-base md:text-lg">
            <p>
              Khi bạn mua một bông hồng Nhất Tâm, bạn sẽ ghi tên người nhận
              vào Chứng Thư Nhất Tâm. Từ đó, mọi bông hồng bạn mua trong tương
              lai sẽ mặc định dành cho người đó.
            </p>
            <p>
              Đây không chỉ là một bông hoa. Đây là một lời thề.
            </p>
            <p className="text-gold italic text-xl md:text-2xl font-light mt-10">
              {'"Vì tình yêu đích thực không cần lựa chọn thứ hai."'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
