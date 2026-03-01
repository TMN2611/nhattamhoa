'use client'

import Link from 'next/link'
import { ShoppingBag, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export function SiteHeader() {
  const { itemCount } = useCart()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="w-24">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm tracking-widest uppercase">
            Menu
          </Link>
        </div>

        <Link href="/" className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-semibold tracking-wider text-foreground">
            Nhất Tâm Hoa
          </span>
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mt-0.5">
            Eternal Roses
          </span>
        </Link>

        <div className="flex items-center gap-5 w-24 justify-end">
          <button aria-label="Tài khoản" className="text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </button>
          <Link href="/checkout" className="relative text-muted-foreground hover:text-foreground transition-colors" aria-label="Giỏ hàng">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}
