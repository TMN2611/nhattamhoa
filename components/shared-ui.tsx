'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function FadeInSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1200ms] ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div
        className="h-px w-16"
        style={{ background: 'linear-gradient(90deg, transparent, var(--gold))' }}
      />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="var(--gold)" opacity="0.6" />
      </svg>
      <div
        className="h-px w-16"
        style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}
      />
    </div>
  )
}

export function PageHero({
  pretitle,
  title,
  subtitle,
}: {
  pretitle: string
  title: string
  subtitle?: string
}) {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-20 text-center px-6">
      <FadeInSection>
        <p className="text-xs tracking-[0.4em] uppercase mb-5 text-gold-dim">
          {pretitle}
        </p>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight text-balance font-display text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">

            {subtitle}
          </p>
        )}
        <GoldDivider className="mt-10" />
      </FadeInSection>
    </section>
  )
}
