import { Suspense } from 'react'
import { ProductPageClient } from './client'
import { products } from '@/lib/products'

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense>
      <ProductPageClient productId={id} />
    </Suspense>
  )
}
