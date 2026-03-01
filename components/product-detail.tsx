'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPrice, type Product } from '@/lib/products'
import { Check } from 'lucide-react'

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart, recipientName: existingRecipient } = useCart()
  const [currentImage, setCurrentImage] = useState(0)
  const [name, setName] = useState(existingRecipient)
  const [accepted, setAccepted] = useState(false)

  const hasExistingRecipient = existingRecipient.length > 0
  const currentName = hasExistingRecipient ? existingRecipient : name
  const canAddToCart = currentName.trim().length > 0 && accepted

  function handleAddToCart() {
    if (!canAddToCart) return
    addToCart(product, currentName.trim())
    router.push('/checkout')
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            <Image
              src={product.images[currentImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`relative h-20 w-20 overflow-hidden border-2 transition-colors ${
                    currentImage === i
                      ? 'border-gold'
                      : 'border-border hover:border-gold-dim'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <p className="text-sm tracking-[0.4em] uppercase text-gold-dim mb-4">
            Nhất Tâm Hoa
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-foreground">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl text-gold tracking-wide">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 text-cream-dim leading-relaxed">
            {product.description}
          </p>

          {/* Divider */}
          <div className="my-8 h-px bg-border" />

          {/* Commitment Box */}
          <div className="border border-border bg-secondary/30 p-6">
            <h3 className="text-lg font-medium text-foreground mb-1">
              Lời Thề Nhất Tâm
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Ai là người duy nhất của cuộc đời bạn?
            </p>

            {hasExistingRecipient ? (
              <div className="bg-muted/50 border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">Người nhận đã được ghi nhận</p>
                <p className="text-lg text-gold font-medium">{existingRecipient}</p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {`Món quà này sẽ mặc định dành cho ${existingRecipient}`}
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="recipient" className="sr-only">Tên người nhận</label>
                <input
                  id="recipient"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên người bạn yêu thương..."
                  className="w-full border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            )}

            {/* Acceptance checkbox */}
            <label className="mt-5 flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-5 w-5 border border-border peer-checked:bg-gold peer-checked:border-gold flex items-center justify-center transition-all">
                  {accepted && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </div>
              <span className="text-sm text-cream-dim leading-relaxed group-hover:text-foreground transition-colors">
                {'Tôi hiểu rằng sự lựa chọn này là vĩnh viễn'}
              </span>
            </label>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`mt-6 w-full py-4 text-sm tracking-[0.3em] uppercase font-medium transition-all duration-500 ${
              canAddToCart
                ? 'bg-gold text-primary-foreground hover:bg-gold-dim cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Thêm vào giỏ hàng
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Miễn phí giao hàng toàn quốc. Bảo hành vĩnh viễn.
          </p>
        </div>
      </div>
    </div>
  )
}
