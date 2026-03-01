'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Product } from '@/lib/products'

export interface CartItem {
  product: Product
  quantity: number
  recipientName: string
  loveLetter?: string
}

interface CartContextType {
  items: CartItem[]
  recipientName: string
  setRecipientName: (name: string) => void
  addToCart: (product: Product, recipientName: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  totalPrice: number
  itemCount: number
  loveLetter: string
  setLoveLetter: (letter: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [recipientName, setRecipientName] = useState('')
  const [loveLetter, setLoveLetter] = useState('')

  const addToCart = useCallback((product: Product, name: string) => {
    setRecipientName(name)
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, recipientName: name }
            : item
        )
      }
      return [...prev, { product, quantity: 1, recipientName: name }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setLoveLetter('')
  }, [])

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        recipientName,
        setRecipientName,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        itemCount,
        loveLetter,
        setLoveLetter,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
