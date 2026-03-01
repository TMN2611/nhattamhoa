'use client'

import { CartProvider } from '@/lib/cart-context'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </CartProvider>
  )
}
