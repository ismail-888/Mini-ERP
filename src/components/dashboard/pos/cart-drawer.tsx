"use client"

import { Minus, Plus, Trash2, ShoppingBag, Percent } from "lucide-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useCart } from "~/contexts/cart-context"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import { cn } from "~/lib/utils"

interface CartDrawerProps {
  onClose?: () => void
}

export function CartDrawer({ onClose }: CartDrawerProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotalUSD,
    totalDiscountUSD,
    totalUSD,
    clearCart,
    getEffectivePrice,
  } = useCart()
  const { formatUSD, formatLBP, convertToLBP } = useExchangeRate()

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">Cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add products to start a sale
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem-3.5rem)]">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {items.map((item) => {
            const effectivePrice = getEffectivePrice(item)
            const hasDiscount = effectivePrice < item.priceUSD
            const lineTotal = effectivePrice * item.quantity

            return (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start gap-3">
                  {/* Product Image Placeholder */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                    <span className="text-lg text-muted-foreground/50">
                      {item.name.charAt(0)}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="truncate text-sm font-medium">
                          {item.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatUSD(item.priceUSD)}
                              </span>
                              <span className="text-sm font-medium text-primary">
                                {formatUSD(effectivePrice)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="h-5 gap-0.5 px-1.5 text-[10px]"
                              >
                                <Percent className="h-2.5 w-2.5" />
                                {item.discountType === "fixed"
                                  ? `-$${item.discountValue}`
                                  : `-${item.discountValue}%`}
                              </Badge>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {formatUSD(item.priceUSD)} each
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold">{formatUSD(lineTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatUSD(subtotalUSD)}</span>
          </div>
          {totalDiscountUSD > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-primary">-{formatUSD(totalDiscountUSD)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-lg font-semibold">Total</span>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">
                {formatUSD(totalUSD)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatLBP(convertToLBP(totalUSD))}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full" size="lg" asChild>
            <Link href="/pos/checkout" onClick={onClose}>
              Checkout
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => {
              clearCart()
              onClose?.()
            }}
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
