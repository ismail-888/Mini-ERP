"use client"

import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
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

interface Category {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  _count: {
    products: number
  }
}

interface CategoryTableProps {
  categories: Category[]
  onAddClick?: () => void
  onEditClick?: (category: Category) => void
  onDeleteClick?: (categoryId: string) => void | Promise<void>
  onViewClick?: (category: Category) => void
  onBulkDelete?: (categoryIds: string[]) => void | Promise<void>
  rightActions?: React.ReactNode
}

export function CategoryTable({ categories, onAddClick, onEditClick, onDeleteClick, onViewClick, onBulkDelete, rightActions }: CategoryTableProps) {
  // Context menu state for row right-click actions (hooks must run unconditionally)
  const [ctxCategory, setCtxCategory] = useState<Category | null>(null)
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null)

  const handleRowRightClick = (category: Category, e?: React.MouseEvent) => {
    if (!e) return
    setCtxCategory(category)
    setCtxPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleClick = () => {
      setCtxCategory(null)
      setCtxPos(null)
    }
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  // --- Columns for DataTable ---
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      meta: { size: "2fr", align: "start" },
      cell: ({ getValue }) => {
        return <span className="font-medium">{String(getValue())}</span>
      },
    },
    {
      id: "productCount",
      header: "Products",
      meta: { size: "120px", align: "center" },
      cell: ({ row }) => {
        const count = row.original._count.products
        return (
          <Badge variant={count > 0 ? "outline" : "secondary"} className="text-center justify-center">
            {count}
          </Badge>
        )
      },
    },
    {
      id: "createdAt",
      header: "Created At",
      meta: { size: "180px", align: "start" },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
      },
    },
    {
      id: "updatedAt",
      header: "Updated At",
      meta: { size: "180px", align: "start" },
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt)
        return <span className="text-sm text-muted-foreground">{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionMenu category={row.original} onEditClick={onEditClick} onDeleteClick={onDeleteClick} onViewClick={onViewClick} />,
      meta: { size: "56px", align: "center" },
    },
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card p-2">
      <DataTable<Category>
        data={categories}
        columns={columns}
        tableName="Categories"
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

      {/* Context menu for row right-click */}
      {ctxCategory && ctxPos && (
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
              onViewClick?.(ctxCategory)
              setCtxCategory(null)
            }}
          >
            View
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-muted rounded"
            onClick={() => {
              onEditClick?.(ctxCategory)
              setCtxCategory(null)
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-3 py-2 text-destructive hover:bg-muted rounded"
            onClick={() => {
              onDeleteClick?.(ctxCategory.id)
              setCtxCategory(null)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

function ActionMenu({ category, onEditClick, onDeleteClick, onViewClick }: { category: Category; onEditClick?: (category: Category) => void; onDeleteClick?: (categoryId: string) => void | Promise<void>; onViewClick?: (category: Category) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewClick?.(category)}>
          <Eye className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditClick?.(category)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDeleteClick?.(category.id)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}