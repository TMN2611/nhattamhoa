'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { products as fallbackProducts, formatPrice } from '@/lib/products'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
  image?: string
  description?: string
  category?: string
}

export function ProductPageClient({ productId }: { productId: string }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`)
        const data = await res.json()
        if (data.success && data.product) {
          setProduct(data.product)
        } else {
          const fallback = fallbackProducts.find(p => p.id === productId)
          if (fallback) {
            setProduct({ ...fallback, image_url: fallback.image })
          }
        }
      } catch {
        const fallback = fallbackProducts.find(p => p.id === productId)
        if (fallback) {
          setProduct({ ...fallback, image_url: fallback.image })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  function handleBeginRitual() {
    if (product) {
      localStorage.setItem('ntt_selected_product', product.id)
      localStorage.removeItem('ntt_ritual_step')
    }
    router.push('/ready')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a08] pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[4/5] bg-[#1a1814] animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-48 bg-[#1a1814] animate-pulse" />
              <div className="h-4 w-full bg-[#1a1814] animate-pulse" />
              <div className="h-4 w-3/4 bg-[#1a1814] animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0a0a08] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8A7D65] mb-4">Sản phẩm không tồn tại.</p>
          <Link href="/" className="text-[#D4AF37] text-sm tracking-wider uppercase">
            Quay lại trang chủ
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] pt-24 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#C5A55A] hover:text-[#D4AF37] transition-colors mb-8 tracking-wider uppercase">
          <ArrowLeft className="h-4 w-4" />
          Bộ sưu tập
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1814]">
            <Image
              src={product.image_url || product.image || '/images/product-1.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="lg:sticky lg:top-24">
            {product.category && (
              <p className="text-xs tracking-[0.3em] uppercase text-[#D4AF37] mb-4">
                {product.category}
              </p>
            )}

            <h1 className="text-3xl md:text-4xl font-light text-[#F5E6C8] font-display mb-4">
              {product.name}
            </h1>

            <p className="text-2xl text-[#D4AF37] font-display mb-6">
              {formatPrice(product.price)}
            </p>

            <div className="h-px w-16 bg-gradient-to-r from-[#D4AF37] to-transparent mb-6" />

            <p className="text-[#8A7D65] leading-relaxed mb-10">
              {product.description}
            </p>

            <button
              onClick={handleBeginRitual}
              className="w-full py-4 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              Begin Ritual
            </button>

            <p className="mt-4 text-center text-xs text-[#6B5F4A] tracking-wider">
              Bắt đầu hành trình nghi lễ hoa thiêng liêng
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
