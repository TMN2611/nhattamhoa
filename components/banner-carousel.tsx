'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title?: string
  image_url: string
  link_url?: string
  is_active: boolean
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/banners')
        const data = await res.json()
        if (data.success && data.banners?.length > 0) {
          setBanners(data.banners.filter((b: Banner) => b.is_active))
        }
      } catch {}
    }
    load()
  }, [])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [banners.length, next])

  if (banners.length === 0) return null

  const banner = banners[current]
  const Wrapper = banner.link_url ? Link : 'div'
  const wrapperProps = banner.link_url ? { href: banner.link_url } : {}

  return (
    <section className="relative w-full overflow-hidden bg-secondary/30">
      <div className="relative aspect-[21/9] md:aspect-[3/1] max-h-[400px] w-full">
        <Wrapper {...(wrapperProps as any)} className="block w-full h-full relative">
          <Image
            src={banner.image_url}
            alt={banner.title || 'Banner'}
            fill
            className="object-cover transition-opacity duration-500"
            priority
          />
          {banner.title && (
            <div className="absolute inset-0 flex items-end justify-center pb-8 bg-gradient-to-t from-background/60 to-transparent">
              <h3 className="text-xl md:text-3xl font-display font-light text-foreground text-center px-6">
                {banner.title}
              </h3>
            </div>
          )}
        </Wrapper>

        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-background/50 backdrop-blur-sm text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-background/50 backdrop-blur-sm text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? 'bg-gold w-6' : 'bg-foreground/30'
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
