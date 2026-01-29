"use client"

import { Plus, Percent } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { useCart } from "~/contexts/cart-context"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import type { Product } from "~/lib/types"
import { cn } from "~/lib/utils"

interface ProductGridProps {
  products: Product[]
}

// Calculate effective price after discount
function getEffectivePrice(product: Product): number {
  if (!product.discountType || !product.discountValue) {
    return product.priceUSD
  }
  if (product.discountType === "fixed") {
    return Math.max(0, product.priceUSD - product.discountValue)
  }
  return product.priceUSD * (1 - product.discountValue / 100)
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const { formatUSD, formatLBP, convertToLBP } = useExchangeRate()

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No products found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or scan a barcode
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => {
        const isOutOfStock = product.stock === 0
        const isLowStock =
          product.stock > 0 && product.stock <= product.minStockAlert
        const effectivePrice = getEffectivePrice(product)
        const hasDiscount = effectivePrice < product.priceUSD

        return (
          <Card
            key={product.id}
            className={cn(
              "relative overflow-hidden transition-all",
              isOutOfStock
                ? "opacity-60"
                : "cursor-pointer hover:border-primary hover:shadow-md"
            )}
          >
            <CardContent className="p-3">
              {/* Product Image Placeholder */}
              <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                <span className="text-3xl text-muted-foreground/50">
                  {product.name.charAt(0)}
                </span>

                {/* Discount Badge */}
                {hasDiscount && (
                  <Badge className="absolute left-1.5 top-1.5 gap-0.5 bg-primary px-1.5 py-0.5 text-[10px]">
                    <Percent className="h-2.5 w-2.5" />
                    {product.discountType === "fixed"
                      ? `-$${product.discountValue}`
                      : `-${product.discountValue}%`}
                  </Badge>
                )}
              </div>

              {/* Status Badge */}
              {isOutOfStock && (
                <Badge
                  variant="destructive"
                  className="absolute right-2 top-2 text-[10px]"
                >
                  Out of Stock
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge
                  variant="outline"
                  className="absolute right-2 top-2 border-warning bg-warning/10 text-[10px] text-warning-foreground"
                >
                  Low Stock
                </Badge>
              )}

              {/* Product Info */}
              <div className="space-y-1">
                <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {product.brand && <span>{product.brand} / </span>}
                  {product.category}
                </p>
                <div className="pt-1">
                  {hasDiscount ? (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-primary">
                          {formatUSD(effectivePrice)}
                        </p>
                        <p className="text-xs text-muted-foreground line-through">
                          {formatUSD(product.priceUSD)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatLBP(convertToLBP(effectivePrice))}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-bold text-foreground">
                        {formatUSD(product.priceUSD)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatLBP(convertToLBP(product.priceUSD))}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Add Button */}
              <Button
                size="sm"
                className="mt-3 w-full"
                disabled={isOutOfStock}
                onClick={() => addItem(product)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
