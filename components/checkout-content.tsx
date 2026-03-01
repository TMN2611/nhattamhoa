'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { X, Download } from 'lucide-react'

function OrderSummary() {
  const { items, recipientName, removeFromCart, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-2xl font-light text-foreground mb-4">Giỏ hàng trống</p>
        <p className="text-muted-foreground mb-8">
          Hãy chọn một bông hồng để bắt đầu lời thề của bạn.
        </p>
        <Link
          href="/"
          className="border border-gold/40 px-8 py-3 text-sm tracking-[0.3em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-all duration-500"
        >
          Khám phá bộ sưu tập
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-foreground mb-6">Tóm tắt đơn hàng</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-4 border border-border p-4">
            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-foreground font-medium">{item.product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {`Dành cho: ${recipientName}`}
                </p>
              </div>
              <p className="text-sm text-gold">{formatPrice(item.product.price)}</p>
            </div>
            <button
              onClick={() => removeFromCart(item.product.id)}
              className="self-start text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Xóa sản phẩm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-between border-t border-border pt-4">
        <span className="text-muted-foreground">Tổng cộng</span>
        <span className="text-xl text-gold font-medium">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  )
}

function LoveLetter() {
  const { loveLetter, setLoveLetter } = useCart()

  return (
    <div className="mt-10">
      <h2 className="text-lg font-medium text-foreground mb-2">Thư Tình</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Gửi gắm thông điệp yêu thương. Lá thư sẽ được in trên giấy thật và gửi kèm hoa.
      </p>
      <div className="border border-border bg-secondary/30 p-6">
        <div className="letter-paper">
          <label htmlFor="love-letter" className="sr-only">Viết thư tình</label>
          <textarea
            id="love-letter"
            value={loveLetter}
            onChange={(e) => setLoveLetter(e.target.value)}
            placeholder="Gửi người tôi yêu thương nhất..."
            rows={8}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none italic leading-8"
          />
        </div>
      </div>
    </div>
  )
}

function CertificateCanvas({
  buyerName,
  recipientName,
}: {
  buyerName: string
  recipientName: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [downloading, setDownloading] = useState(false)

  function drawCertificate() {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 1200
    const h = 800
    canvas.width = w
    canvas.height = h

    // Background
    ctx.fillStyle = '#1a1714'
    ctx.fillRect(0, 0, w, h)

    // Border
    ctx.strokeStyle = '#b8a068'
    ctx.lineWidth = 2
    ctx.strokeRect(40, 40, w - 80, h - 80)

    // Inner border
    ctx.strokeStyle = '#b8a06840'
    ctx.lineWidth = 1
    ctx.strokeRect(50, 50, w - 100, h - 100)

    // Title
    ctx.fillStyle = '#b8a068'
    ctx.font = '16px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('CHUNG THU', w / 2, 120)

    ctx.fillStyle = '#f0e6d0'
    ctx.font = '48px Georgia, serif'
    ctx.fillText('Nhất Tâm Hoa', w / 2, 180)

    ctx.fillStyle = '#b8a068'
    ctx.font = 'italic 14px Georgia, serif'
    ctx.fillText('Eternal Roses - Một đời, một đóa, một người', w / 2, 215)

    // Divider
    ctx.strokeStyle = '#b8a068'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w / 2 - 100, 250)
    ctx.lineTo(w / 2 + 100, 250)
    ctx.stroke()

    // Body
    ctx.fillStyle = '#c0b090'
    ctx.font = '18px Georgia, serif'
    ctx.fillText('Chứng nhận rằng', w / 2, 310)

    ctx.fillStyle = '#f0e6d0'
    ctx.font = 'italic 36px Georgia, serif'
    ctx.fillText(buyerName || 'Người tặng', w / 2, 370)

    ctx.fillStyle = '#c0b090'
    ctx.font = '18px Georgia, serif'
    ctx.fillText('đã trao trọn tâm ý cho', w / 2, 420)

    ctx.fillStyle = '#f0e6d0'
    ctx.font = 'italic 36px Georgia, serif'
    ctx.fillText(recipientName || 'Người nhận', w / 2, 480)

    ctx.fillStyle = '#c0b090'
    ctx.font = '18px Georgia, serif'
    ctx.fillText('Lời thề này là vĩnh viễn và không thể thay đổi.', w / 2, 540)

    // Date
    const today = new Date().toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    ctx.fillStyle = '#b8a068'
    ctx.font = '14px Georgia, serif'
    ctx.fillText(today, w / 2, 610)

    // Bottom decor
    ctx.strokeStyle = '#b8a068'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w / 2 - 60, 650)
    ctx.lineTo(w / 2 + 60, 650)
    ctx.stroke()

    ctx.fillStyle = '#b8a06880'
    ctx.font = '12px Georgia, serif'
    ctx.fillText('Nhất Tâm Hoa - nhatamhoa.vn', w / 2, 690)
  }

  function handleDownload() {
    setDownloading(true)
    drawCertificate()
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const link = document.createElement('a')
      link.download = 'chung-thu-nhat-tam.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      setDownloading(false)
    }, 100)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 border border-gold/40 px-8 py-3 text-sm tracking-[0.2em] uppercase text-gold hover:bg-gold hover:text-primary-foreground transition-all duration-500"
      >
        <Download className="h-4 w-4" />
        Tải chứng thư
      </button>
    </div>
  )
}

function SuccessPage({ buyerName }: { buyerName: string }) {
  const { recipientName } = useCart()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm tracking-[0.4em] uppercase text-gold-dim mb-6">
        Lời thề đã được xác nhận
      </p>
      <h1 className="text-3xl md:text-5xl font-light text-foreground text-balance">
        Chứng Thư Nhất Tâm
      </h1>
      <p className="mx-auto mt-6 max-w-md text-cream-dim leading-relaxed">
        {`Tình yêu của ${buyerName || 'bạn'} dành cho ${recipientName} đã được ghi nhận. `}
        Chứng thư này là bằng chứng vĩnh viễn cho lời thề của bạn.
      </p>

      {/* Visual certificate preview */}
      <div className="mt-10 w-full max-w-2xl border border-gold/30 bg-secondary/30 p-8 md:p-12">
        <div className="border border-gold/20 p-6 md:p-10 text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-gold-dim">Chứng thư</p>
          <h2 className="mt-4 text-2xl md:text-3xl font-light text-foreground">Nhất Tâm Hoa</h2>
          <p className="mt-1 text-xs italic text-muted-foreground">
            Eternal Roses
          </p>
          <div className="mx-auto my-6 w-24 h-px bg-gold/40" />
          <p className="text-sm text-cream-dim">Chứng nhận rằng</p>
          <p className="mt-3 text-2xl italic text-gold">{buyerName || 'Người tặng'}</p>
          <p className="mt-3 text-sm text-cream-dim">đã trao trọn tâm ý cho</p>
          <p className="mt-3 text-2xl italic text-gold">{recipientName}</p>
          <div className="mx-auto my-6 w-24 h-px bg-gold/40" />
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('vi-VN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <CertificateCanvas buyerName={buyerName} recipientName={recipientName} />
      </div>

      <Link
        href="/"
        className="mt-10 text-sm text-muted-foreground hover:text-gold transition-colors tracking-wider uppercase"
      >
        Quay về trang chủ
      </Link>
    </div>
  )
}

export function CheckoutContent() {
  const { items, recipientName } = useCart()
  const [buyerName, setBuyerName] = useState('')
  const [completed, setCompleted] = useState(false)

  if (completed) {
    return <SuccessPage buyerName={buyerName} />
  }

  if (items.length === 0) {
    return <OrderSummary />
  }

  function handleCheckout() {
    setCompleted(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
      {/* Left column */}
      <div>
        <OrderSummary />
        <LoveLetter />
      </div>

      {/* Right column */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-6">Thông tin thanh toán</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="buyer-name" className="text-sm text-muted-foreground mb-1.5 block">
              Tên của bạn
            </label>
            <input
              id="buyer-name"
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="buyer-email" className="text-sm text-muted-foreground mb-1.5 block">
              Email
            </label>
            <input
              id="buyer-email"
              type="email"
              placeholder="email@example.com"
              className="w-full border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="buyer-phone" className="text-sm text-muted-foreground mb-1.5 block">
              Số điện thoại
            </label>
            <input
              id="buyer-phone"
              type="tel"
              placeholder="0xxx xxx xxx"
              className="w-full border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label htmlFor="buyer-address" className="text-sm text-muted-foreground mb-1.5 block">
              Địa chỉ giao hàng
            </label>
            <textarea
              id="buyer-address"
              rows={3}
              placeholder="Nhập địa chỉ giao hàng..."
              className="w-full border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>
        </div>

        {/* Vow summary */}
        <div className="mt-8 border border-gold/20 bg-secondary/30 p-6 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold-dim mb-2">Lời thề Nhất Tâm</p>
          <p className="text-cream-dim text-sm leading-relaxed">
            {`Bạn xác nhận rằng tất cả hoa hồng Nhất Tâm của bạn, hôm nay và mãi mãi, chỉ dành cho `}
            <span className="text-gold italic text-lg">{recipientName}</span>
          </p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={!buyerName.trim()}
          className={`mt-6 w-full py-4 text-sm tracking-[0.3em] uppercase font-medium transition-all duration-500 ${
            buyerName.trim()
              ? 'bg-gold text-primary-foreground hover:bg-gold-dim cursor-pointer'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {'Xác nhận lời thề & Thanh toán'}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Thanh toán an toàn. Chứng thư sẽ được gửi sau khi xác nhận.
        </p>
      </div>
    </div>
  )
}
