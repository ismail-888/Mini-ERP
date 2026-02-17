"use client"

import { Minus, Plus, Trash2, ShoppingBag, Percent } from "lucide-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useCart } from "~/contexts/cart-context"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
// import { cn } from "~/lib/utils"

interface CartDrawerProps {
  onClose?: () => void;
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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-base font-semibold text-foreground">Cart is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Scan or add products to start a sale
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Cart Items */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-4">
        <div className="space-y-2.5 lg:space-y-3">
          {items.map((item) => {
            const effectivePrice = getEffectivePrice(item)
            const hasDiscount = effectivePrice < item.salePriceUSD
            const lineTotal = effectivePrice * item.quantity

            return (
              <div
                key={item.id}
                className="group rounded-lg border border-border bg-card p-2.5 lg:p-3 transition-all hover:border-muted-foreground/20 hover:shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  {/* Product Image Placeholder */}
                  <div className="flex h-12 w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-md bg-muted/50 text-base lg:text-lg font-medium text-muted-foreground/50 transition-colors group-hover:bg-muted">
                    {item.name.charAt(0)}
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-xs lg:text-sm font-medium text-foreground">
                          {item.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {hasDiscount ? (
                            <>
                              <span className="text-[10px] text-muted-foreground line-through">
                                {formatUSD(item.salePriceUSD)}
                              </span>
                              <span className="text-xs font-medium text-primary">
                                {formatUSD(effectivePrice)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="h-4 gap-0.5 px-1 text-[9px]"
                              >
                                <Percent className="h-2 w-2" />
                                {item.discountType === "fixed"
                                  ? `-$${item.discountValue}`
                                  : `-${item.discountValue}%`}
                              </Badge>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {formatUSD(item.salePriceUSD)} each
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 lg:gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 lg:h-8 lg:w-8 bg-background transition-colors"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 lg:w-7 text-center text-xs lg:text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 lg:h-8 lg:w-8 bg-background transition-colors"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm lg:text-base font-bold">{formatUSD(lineTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="shrink-0 border-t border-border bg-muted/50 dark:bg-muted/20 p-3 lg:p-4">
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatUSD(subtotalUSD)}</span>
          </div>
          {totalDiscountUSD > 0 && (
            <div className="flex items-center justify-between text-xs lg:text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-primary">-{formatUSD(totalDiscountUSD)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-base lg:text-lg font-bold">Total</span>
            <div className="text-right">
              <p className="text-lg lg:text-xl font-bold text-foreground">
                {formatUSD(totalUSD)}
              </p>
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                {formatLBP(convertToLBP(totalUSD))}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full h-11 text-sm font-semibold shadow-sm" asChild>
            <Link href="/dashboard/pos/checkout" onClick={onClose}>
              Checkout
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full h-9 bg-background hover:bg-muted text-xs font-medium"
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
