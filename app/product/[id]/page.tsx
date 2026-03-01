import { ProductPageClient } from './client'
import { products } from '@/lib/products'

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Sản phẩm không tồn tại.</p>
      </div>
    )
  }

  return <ProductPageClient product={product} />
}
