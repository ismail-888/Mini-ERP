"use client"

import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import type { Product } from "~/lib/types"
import { cn } from "~/lib/utils"

interface ProductTableProps {
  products: Product[]
}

export function ProductTable({ products }: ProductTableProps) {
  const { formatUSD } = useExchangeRate()

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No products found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  const getStockBadge = (product: Product) => {
    const { stock, minStockAlert } = product
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="text-[10px]">
          Out of Stock
        </Badge>
      )
    }
    if (stock <= minStockAlert) {
      return (
        <Badge
          variant="outline"
          className="border-warning bg-warning/10 text-[10px] text-warning-foreground"
        >
          Low ({stock})
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="border-primary bg-primary/10 text-[10px] text-primary"
      >
        {stock}
      </Badge>
    )
  }

  const getProfitMargin = (product: Product) => {
    const margin = ((product.priceUSD - product.costUSD) / product.costUSD) * 100
    return margin
  }

  const getEffectivePrice = (product: Product) => {
    if (!product.discountType || !product.discountValue) {
      return product.priceUSD
    }
    if (product.discountType === "fixed") {
      return Math.max(0, product.priceUSD - product.discountValue)
    }
    return product.priceUSD * (1 - product.discountValue / 100)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12" />
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="font-mono text-xs">Barcode</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const margin = getProfitMargin(product)
              const effectivePrice = getEffectivePrice(product)
              const hasDiscount = effectivePrice < product.priceUSD

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      {product.brand && (
                        <span className="text-xs text-muted-foreground">
                          {product.brand}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{product.category}</span>
                      {product.subcategory && (
                        <span className="text-xs text-muted-foreground">
                          {product.subcategory}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.barcode}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStockBadge(product)}
                      {product.stock <= product.minStockAlert &&
                        product.stock > 0 && (
                          <AlertTriangle className="h-3 w-3 text-warning" />
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatUSD(product.costUSD)}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasDiscount ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground line-through">
                          {formatUSD(product.priceUSD)}
                        </span>
                        <span className="font-medium text-primary">
                          {formatUSD(effectivePrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">
                        {formatUSD(product.priceUSD)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        margin > 20
                          ? "text-primary"
                          : margin > 0
                            ? "text-warning-foreground"
                            : "text-destructive"
                      )}
                    >
                      {margin.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y divide-border lg:hidden">
        {products.map((product) => {
          const margin = getProfitMargin(product)
          const effectivePrice = getEffectivePrice(product)
          const hasDiscount = effectivePrice < product.priceUSD

          return (
            <div key={product.id} className="flex items-start gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                <span className="text-lg text-muted-foreground">
                  {product.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="truncate font-medium">{product.name}</h3>
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">
                        {product.brand}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {product.category}
                  {product.subcategory && ` / ${product.subcategory}`}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {getStockBadge(product)}
                  <span
                    className={cn(
                      "text-xs font-medium",
                      margin > 20
                        ? "text-primary"
                        : margin > 0
                          ? "text-warning-foreground"
                          : "text-destructive"
                    )}
                  >
                    {margin.toFixed(0)}% margin
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Cost: {formatUSD(product.costUSD)}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  {hasDiscount ? (
                    <>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatUSD(product.priceUSD)}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {formatUSD(effectivePrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold">
                      {formatUSD(product.priceUSD)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
