import { HeroSection } from '@/components/hero-section'
import { ProductGrid } from '@/components/product-grid'
import { LiveVowFeed } from '@/components/live-vow-feed'
import { CommitmentSection } from '@/components/commitment-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <section id="collection">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-6 md:pt-28 md:pb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-3 text-center">
            Gift Collection
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display text-center text-balance">
            Bộ sưu tập quà tặng
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[#8A7D65] leading-relaxed">
            Những đóa hồng vĩnh cửu — món quà mang theo lời hứa không phai.
          </p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>
        <ProductGrid flow="gift" />
      </section>

      <section id="ritual-space" className="border-t border-[#D4AF37]/10">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-6 md:pt-28 md:pb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] mb-3 text-center">
            Ritual Collection
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display text-center text-balance">
            Bộ sưu tập nghi lễ cam kết
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-[#8A7D65] leading-relaxed">
            Nơi những lời thề được ghi nhận — và những cam kết được tôn vinh.
          </p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>
        <ProductGrid flow="ritual" />
      </section>

      <section className="border-t border-[#D4AF37]/10">
        <LiveVowFeed />
        <CommitmentSection />
      </section>
    </>
  )
}
