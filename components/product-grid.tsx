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

interface ProductGridProps {
  flow?: 'gift' | 'ritual'
}

export function ProductGrid({ flow = 'gift' }: ProductGridProps) {
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
      <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-[#1a1814] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  function getProductHref(product: Product) {
    if (flow === 'ritual') {
      return `/product/${product.id}?flow=ritual`
    }
    return `/product/${product.id}?flow=gift`
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link
            key={product.id}
            href={getProductHref(product)}
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
              {flow === 'ritual' && (
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#D4AF37]/90 text-[#0a0a08] text-[10px] tracking-[0.2em] uppercase font-medium">
                  Nghi lễ
                </div>
              )}
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
    </div>
  )
}
