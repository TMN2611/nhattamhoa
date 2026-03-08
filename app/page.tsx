import { HeroSection } from '@/components/hero-section'
import { ProductGrid } from '@/components/product-grid'
import { LiveVowFeed } from '@/components/live-vow-feed'
import { CommitmentSection } from '@/components/commitment-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductGrid />
      <LiveVowFeed />
      <CommitmentSection />
    </>
  )
}
