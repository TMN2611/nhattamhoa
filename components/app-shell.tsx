'use client'

import { usePathname } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <CartProvider>{children}</CartProvider>
  }

  return (
    <CartProvider>
      <SiteHeader />
      <main className="pt-[72px]">{children}</main>
      <SiteFooter />
    </CartProvider>
  )
}
