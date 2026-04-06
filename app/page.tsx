import { HeroSection } from '@/components/hero-section'
import { ProductGrid } from '@/components/product-grid'
import { LiveVowFeed } from '@/components/live-vow-feed'
import { CommitmentSection } from '@/components/commitment-section'
import { BannerCarousel } from '@/components/banner-carousel'
import { ReviewsSection } from '@/components/reviews-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <BannerCarousel />

      <section id="collection">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-6 md:pt-28 md:pb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3 text-center">
            Gift Collection
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-foreground font-display text-center text-balance">
            Bộ sưu tập quà tặng
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground leading-relaxed">
            Những đóa hồng vĩnh cửu — món quà mang theo lời hứa không phai.
          </p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
        <ProductGrid flow="gift" />
      </section>

      <section id="ritual-space" className="border-t border-border/30">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-6 md:pt-28 md:pb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3 text-center">
            Ritual Collection
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-foreground font-display text-center text-balance">
            Bộ sưu tập nghi lễ cam kết
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground leading-relaxed">
            Nơi những lời thề được ghi nhận — và những cam kết được tôn vinh.
          </p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
        <ProductGrid flow="ritual" />
      </section>

      <section className="border-t border-border/30">
        <ReviewsSection />
      </section>

      <section className="border-t border-border/30">
        <LiveVowFeed />
        <CommitmentSection />
      </section>
    </>
  )
}
