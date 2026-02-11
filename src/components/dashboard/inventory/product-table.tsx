"use client"

import { MoreHorizontal, Pencil, Trash2, AlertTriangle, Eye } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import DataTable from "~/components/shared/Table/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { useState, useEffect } from "react"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import type { Product } from "~/lib/types"
import { cn } from "~/lib/utils"

interface ProductTableProps {
  products: Product[]
  onAddClick?: () => void
  onEditClick?: (product: Product) => void
  onDeleteClick?: (productId: string) => void | Promise<void>
  onViewClick?: (product: Product) => void
  onBulkDelete?: (productIds: string[]) => void | Promise<void>
  rightActions?: React.ReactNode
}

export function ProductTable({ products, onAddClick, onEditClick, onDeleteClick, onViewClick, onBulkDelete, rightActions }: ProductTableProps) {
  const { formatUSD } = useExchangeRate()

  // Context menu state for row double-click actions (hooks must run unconditionally)
  const [ctxProduct, setCtxProduct] = useState<Product | null>(null)
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null)

  const handleRowRightClick = (product: Product, e?: React.MouseEvent) => {
    if (!e) return
    setCtxProduct(product)
    setCtxPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleClick = () => {
      setCtxProduct(null)
      setCtxPos(null)
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

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
 
  const safeString = (v: unknown, fallback = ""): string => {
    if (v == null) return fallback
    if (typeof v === "string") return v
    if (typeof v === "number") return String(v)
    try {
      return JSON.stringify(v)
    } catch {
      return fallback
    }
  }
 
  // Columns for DataTable (virtualized)
  const columns: ColumnDef<Product>[] = [
    {
      id: "avatar",
      header: "Images",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted overflow-hidden">
            {product.image ? (
              <img src={product.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm text-muted-foreground">{product.name.charAt(0)}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { size: "2fr", align: "start" },
      cell: ({ getValue, row }) => {
        const brand = row.original.brand?.name ?? "No Brand"
        return (
          <div className="flex flex-col">
            <span className="font-medium">{String(getValue())}</span>
            <span className="text-xs text-muted-foreground">{brand}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      meta: { size: "1fr", align: "start" },
      cell: ({ getValue }) => {
        return <span className="text-sm">{safeString(getValue(), "General")}</span>
      },
    },
    {
      accessorKey: "barcode",
      header: "Barcode",
      meta: { size: "140px", align: "start" },
      cell: ({ getValue }) => {
        return <span className="font-mono text-xs text-muted-foreground">{safeString(getValue(), "—")}</span>
      },
    },
    {
      id: "stock",
      header: "Stock",
      meta: { size: "120px", align: "center" },
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          {getStockBadge(row.original)}
          {row.original.currentStock <= row.original.minStockAlert && row.original.currentStock > 0 && (
            <AlertTriangle className="h-3 w-3 text-orange-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "costPriceUSD",
      header: "Cost",
      meta: { size: "120px", align: "right" },
      cell: ({ getValue }) => <span className="text-right text-sm text-muted-foreground">{formatUSD(getValue() as number)}</span>,
    },
    {
      id: "price",
      header: "Price",
      meta: { size: "140px", align: "right" },
      cell: ({ row }) => {
        const effectivePrice = getEffectivePrice(row.original)
        const hasDiscount = effectivePrice < row.original.salePriceUSD
        return hasDiscount ? (
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground line-through">{formatUSD(row.original.salePriceUSD)}</span>
            <span className="font-medium text-primary">{formatUSD(effectivePrice)}</span>
          </div>
        ) : (
          <span className="font-medium">{formatUSD(row.original.salePriceUSD)}</span>
        )
      },
    },
    {
      id: "margin",
      header: "Margin",
      meta: { size: "110px", align: "right" },
      cell: ({ row }) => {
        const margin = getProfitMargin(row.original)
        return (
          <span className={cn(
            "text-sm font-medium",
            margin > 20 ? "text-primary" : margin > 0 ? "text-orange-600" : "text-destructive"
          )}>
            {margin.toFixed(0)}%
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionMenu product={row.original} onEditClick={onEditClick} onDeleteClick={onDeleteClick} onViewClick={onViewClick} />,
      meta: { size: "56px", align: "center" },
    },
  ]

  // (moved to top to keep hooks unconditional)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-2">
      <DataTable<Product>
        data={products}
        columns={columns}
        tableName="Products"
        onAddClick={onAddClick}
        rightActions={rightActions}
        onBulkDelete={onBulkDelete}
        onRowDoubleClick={onViewClick}
        rowHeight={56}
        maxHeight={470}
        onRowRightClick={handleRowRightClick}
        enableRowSelection={true}
        enablePagination={true}
        pageSize={10}
      />

      {/* Context menu for row double-click */}
      {ctxProduct && ctxPos && (
        <div
          className="z-50 rounded-md border bg-card p-2 shadow-md"
          style={{
            position: "fixed",
            left: ctxPos.x,
            top: ctxPos.y,
            transform: "translate(8px, 8px)",
            minWidth: 160,
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <button
            className="w-full text-left px-3 py-2 hover:bg-muted rounded"
            onClick={() => {
              onViewClick?.(ctxProduct)
              setCtxProduct(null)
            }}
          >
            View
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-muted rounded"
            onClick={() => {
              onEditClick?.(ctxProduct)
              setCtxProduct(null)
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-3 py-2 text-destructive hover:bg-muted rounded"
            onClick={() => {
              onDeleteClick?.(ctxProduct.id)
              setCtxProduct(null)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function ActionMenu({ product, onEditClick, onDeleteClick, onViewClick }: { product: Product; onEditClick?: (product: Product) => void; onDeleteClick?: (productId: string) => void | Promise<void>; onViewClick?: (product: Product) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewClick?.(product)}>
          <Eye className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditClick?.(product)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteClick?.(product.id)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}