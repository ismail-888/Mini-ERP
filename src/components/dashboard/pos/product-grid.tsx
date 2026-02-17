"use client"

import { Plus, Percent, Package } from "lucide-react"
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
    return product.salePriceUSD
  }
  if (product.discountType === "fixed") {
    return Math.max(0, product.salePriceUSD - product.discountValue)
  }
  return product.salePriceUSD * (1 - product.discountValue / 100)
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const { formatUSD, formatLBP, convertToLBP } = useExchangeRate()

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          <Package className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-base font-semibold text-foreground">
          No products found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or scan a barcode
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((product) => {
        const isOutOfStock = product.currentStock === 0
        const isLowStock =
          product.currentStock > 0 && product.currentStock <= product.minStockAlert
        const effectivePrice = getEffectivePrice(product)
        const hasDiscount = effectivePrice < product.salePriceUSD

        return (
          <Card
            key={product.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-200",
              isOutOfStock
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-[1.02] hover:border-primary/50 hover:shadow-md dark:hover:shadow-primary/5"
            )}
          >
            <CardContent className="p-2.5 lg:p-3">
              {/* Product Image Placeholder */}
              <div className="relative mb-2 lg:mb-2.5 aspect-square overflow-hidden rounded-lg bg-linear-to-br from-muted/50 to-muted flex items-center justify-center transition-colors group-hover:from-muted/70 group-hover:to-muted/90">
                <span className="text-2xl lg:text-3xl font-semibold text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                  {product.name.charAt(0)}
                </span>

                {/* Discount Badge */}
                {hasDiscount && (
                  <Badge className="absolute left-1.5 top-1.5 gap-0.5 bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] lg:text-[10px] font-semibold shadow-sm">
                    <Percent className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
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
                  className="absolute right-1.5 top-1.5 text-[9px] lg:text-[10px] font-semibold shadow-sm"
                >
                  Out of Stock
                </Badge>
              )}
              {isLowStock && !isOutOfStock && (
                <Badge
                  variant="outline"
                  className="absolute right-1.5 top-1.5 border-warning bg-warning/10 backdrop-blur-sm text-[9px] lg:text-[10px] font-semibold text-warning-foreground shadow-sm"
                >
                  Low Stock
                </Badge>
              )}

              {/* Product Info */}
              <div className="space-y-0.5 lg:space-y-1">
                <h3 className="line-clamp-2 text-xs lg:text-sm font-semibold leading-tight ">
                  {product.name}
                </h3>
                <p className="text-[10px] lg:text-xs text-muted-foreground truncate">
                  {product.brand && <span className="font-medium">{typeof product.brand === 'string' ? product.brand : product.brand.name}</span>}
                  {product.brand && product.category && <span className="mx-1">•</span>}
                  {product.category && <span>{typeof product.category === 'string' ? product.category : product.category?.name}</span>}
                </p>
                <div className="pt-0.5 lg:pt-1">
                  {hasDiscount ? (
                    <>
                      <div className="flex items-center gap-1.5 lg:gap-2">
                        <p className="text-sm lg:text-base font-bold text-primary">
                          {formatUSD(effectivePrice)}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground line-through">
                          {formatUSD(product.salePriceUSD)}
                        </p>
                      </div>
                      <p className="text-[10px] lg:text-xs text-muted-foreground truncate">
                        {formatLBP(convertToLBP(effectivePrice))}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm lg:text-base font-bold text-foreground">
                        {formatUSD(product.salePriceUSD)}
                      </p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground truncate">
                        {formatLBP(convertToLBP(product.salePriceUSD))}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Add Button */}
              <Button
                size="sm"
                className="mt-2 lg:mt-2.5 w-full h-8 lg:h-9 text-xs lg:text-sm font-semibold shadow-sm transition-all group-hover:shadow-md"
                disabled={isOutOfStock}
                onClick={() => addItem(product)}
              >
                <Plus className="mr-1 h-3 w-3 lg:h-3.5 lg:w-3.5" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
