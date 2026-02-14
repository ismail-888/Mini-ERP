"use client"

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react"
import type { Product, CartItem } from "~/lib/types"

// دالة محسنة ومستقلة لحساب السعر الفعلي مع مراعاة تواريخ الخصم
function getEffectivePrice(product: Product): number {
  const now = new Date()
  
  // التحقق مما إذا كان الخصم سارياً (إذا وجدت تواريخ)
  const hasStarted = !product.discountStartDate || new Date(product.discountStartDate) <= now
  const hasNotEnded = !product.discountEndDate || new Date(product.discountEndDate) >= now
  const isDiscountActive = hasStarted && hasNotEnded

  if (!isDiscountActive || !product.discountType || !product.discountValue) {
    return product.salePriceUSD
  }

  if (product.discountType === "fixed") {
    return Math.max(0, product.salePriceUSD - product.discountValue)
  }
  
  // نسبة مئوية (percentage)
  return product.salePriceUSD * (1 - product.discountValue / 100)
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

  // إضافة منتج - استخدام useCallback لمنع إعادة تعريف الدالة بشكل متكرر
  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      const effectivePrice = getEffectivePrice(product)

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                lineTotalUSD: effectivePrice * (item.quantity + 1) 
              }
            : item
        )
      }
      
      // إضافة منتج جديد مع حساب الـ lineTotalUSD فوراً
      return [...current, { ...product, quantity: 1, lineTotalUSD: effectivePrice }]
    })
  }, [])

  // حذف منتج
  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }, [])

  // تحديث الكمية يدوياً (مثلاً من الـ Input)
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.id !== productId))
      return
    }

    setItems((current) =>
      current.map((item) => {
        if (item.id === productId) {
          const effectivePrice = getEffectivePrice(item)
          return { 
            ...item, 
            quantity, 
            lineTotalUSD: effectivePrice * quantity 
          }
        }
        return item
      })
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  // حساب المجاميع باستخدام useMemo لضمان الأداء العالي
  // يتم الحساب في "دورة واحدة" (One single reduce) بدلاً من تكرار الـ reduce
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const effectivePrice = getEffectivePrice(item)
        const itemDiscount = (item.salePriceUSD - effectivePrice) * item.quantity
        
        return {
          subtotal: acc.subtotal + (item.salePriceUSD * item.quantity),
          discount: acc.discount + itemDiscount,
          total: acc.total + item.lineTotalUSD,
          count: acc.count + item.quantity,
        }
      },
      { subtotal: 0, discount: 0, total: 0, count: 0 }
    )
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalUSD: totals.subtotal,
        totalDiscountUSD: totals.discount,
        totalUSD: totals.total,
        itemCount: totals.count,
        getEffectivePrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}