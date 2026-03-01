'use client'

import { ProductDetail } from '@/components/product-detail'
import type { Product } from '@/lib/products'

export function ProductPageClient({ product }: { product: Product }) {
  return <ProductDetail product={product} />
}
