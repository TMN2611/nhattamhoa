'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/rose-hero.jpg"
          alt="Hoa hồng vĩnh cửu Nhất Tâm Hoa"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className={`transition-all duration-[1500ms] ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="mb-6 text-sm tracking-[0.4em] uppercase text-gold-dim">
            Preserved Eternal Roses
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-light leading-tight text-foreground text-balance">
            Một đời, một đóa,
            <br />
            <span className="font-semibold italic text-shimmer">một người</span>
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-base md:text-lg leading-relaxed text-cream-dim">
            Mỗi bông hồng Nhất Tâm chỉ được tặng cho một người duy nhất.
            Không thay đổi. Không ngoại lệ.
          </p>
          <div className="mt-12">
            <a
              href="#collection"
              className="inline-block border border-gold/40 px-10 py-4 text-sm tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-all duration-500"
            >
              Khám phá bộ sưu tập
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Scroll</span>
        <div className="h-8 w-px bg-gold-dim/50 animate-pulse" />
      </div>
    </section>
  )
}
