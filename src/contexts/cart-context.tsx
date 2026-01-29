"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Product, CartItem } from "~/lib/types"

// Calculate the effective price after discount
function getEffectivePrice(product: Product): number {
  if (!product.discountType || !product.discountValue) {
    return product.priceUSD
  }
  if (product.discountType === "fixed") {
    return Math.max(0, product.priceUSD - product.discountValue)
  }
  // percentage
  return product.priceUSD * (1 - product.discountValue / 100)
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  subtotalUSD: number
  totalDiscountUSD: number
  totalUSD: number
  itemCount: number
  getEffectivePrice: (product: Product) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setItems([])

  // Subtotal = sum of original prices
  const subtotalUSD = items.reduce(
    (sum, item) => sum + item.priceUSD * item.quantity,
    0
  )

  // Total discount = sum of all discounts
  const totalDiscountUSD = items.reduce((sum, item) => {
    const effectivePrice = getEffectivePrice(item)
    const discount = (item.priceUSD - effectivePrice) * item.quantity
    return sum + discount
  }, 0)

  // Final total = subtotal - discount
  const totalUSD = subtotalUSD - totalDiscountUSD

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalUSD,
        totalDiscountUSD,
        totalUSD,
        itemCount,
        getEffectivePrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
