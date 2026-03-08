'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        if (data.success && data.products?.length > 0) {
          setProducts(data.products)
        } else {
          setProducts(fallbackProducts.map(p => ({ ...p, image_url: p.image })))
        }
      } catch {
        setProducts(fallbackProducts.map(p => ({ ...p, image_url: p.image })))
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  if (loading) {
    return (
      <section id="collection" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-16 text-center">
          <p className="text-sm tracking-[0.4em] uppercase text-gold-dim mb-4">The Collection</p>
          <h2 className="text-3xl md:text-5xl font-light text-foreground">Bộ sưu tập hoa hồng bất tử</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-[#1a1814] animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="collection" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="mb-16 text-center">
        <p className="text-sm tracking-[0.4em] uppercase text-gold-dim mb-4">The Collection</p>
        <h2 className="text-3xl md:text-5xl font-light text-foreground text-balance">Bộ sưu tập hoa hồng bất tử</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground leading-relaxed">
          Mỗi bông hoa được tuyển chọn và bảo tồn bằng quy trình đặc biệt, giữ nguyên vẻ đẹp qua năm tháng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image
                src={product.image_url || product.image || '/images/product-1.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors duration-500" />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-lg font-medium text-foreground group-hover:text-gold transition-colors duration-300">
                {product.name}
              </h3>
              <span className="text-sm text-gold-dim tracking-wide">
                {formatPrice(product.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
