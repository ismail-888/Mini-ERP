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
        <p className="text-lg font-medium text-muted-foreground">No products found</p>
        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    )
  }

  // --- Helper Logic aligned with Prisma schema names ---
  const getStockBadge = (product: Product) => {
    const stock = product.currentStock
    const minAlert = product.minStockAlert

    if (stock === 0) return <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
    if (stock <= minAlert) {
      return (
        <Badge variant="outline" className="border-orange-500 bg-orange-500/10 text-[10px] text-orange-600">
          Low ({stock})
        </Badge>
      )
    }
    return <Badge variant="outline" className="border-primary bg-primary/10 text-[10px] text-primary">{stock}</Badge>
  }

  const getEffectivePrice = (product: Product) => {
    const price = product.salePriceUSD
    if (!product.discountType || !product.discountValue) return price
    
    // Check if discount is currently active
    const now = new Date()
    if (product.discountStartDate && new Date(product.discountStartDate) > now) return price
    if (product.discountEndDate && new Date(product.discountEndDate) < now) return price

    if (product.discountType === "fixed") return Math.max(0, price - product.discountValue)
    return price * (1 - product.discountValue / 100)
  }

  const getProfitMargin = (product: Product) => {
    const cost = product.costPriceUSD ?? 0
    if (!cost || cost === 0) return 0
    const effectivePrice = getEffectivePrice(product)
    return ((effectivePrice - cost) / cost) * 100
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
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
              const hasDiscount = effectivePrice < product.salePriceUSD

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{product.name.charAt(0)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{product.brand ?? "No Brand"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{product.category ?? "General"}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.barcode ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStockBadge(product)}
                      {product.currentStock <= product.minStockAlert && product.currentStock > 0 && (
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatUSD(product.costPriceUSD)}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasDiscount ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground line-through">{formatUSD(product.salePriceUSD)}</span>
                        <span className="font-medium text-primary">{formatUSD(effectivePrice)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatUSD(product.salePriceUSD)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-sm font-medium",
                      margin > 20 ? "text-primary" : margin > 0 ? "text-orange-600" : "text-destructive"
                    )}>
                      {margin.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <ActionMenu />
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

          return (
            <div key={product.id} className="flex items-start gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                <span className="text-lg text-muted-foreground">{product.name.charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="truncate font-medium">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.brand ?? "No Brand"}</p>
                  </div>
                  <ActionMenu />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {getStockBadge(product)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {margin.toFixed(0)}% margin
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                   <span className="text-xs text-muted-foreground">Cost: {formatUSD(product.costPriceUSD)}</span>
                   <span className="font-bold text-primary">{formatUSD(effectivePrice)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}