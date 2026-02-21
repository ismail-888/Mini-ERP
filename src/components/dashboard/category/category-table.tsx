"use client"

import { Badge } from "~/components/ui/badge"
import DataTable from "~/components/shared/Table/DataTable"
import { ActionMenu } from "~/components/shared/ActionMenu"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

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
  isLoading?: boolean
}

export function CategoryTable({ categories, onAddClick, onEditClick, onDeleteClick, onViewClick, onBulkDelete, rightActions, isLoading }: CategoryTableProps) {
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
      accessorFn: (row) => row._count.products,
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
      filterFn: (row, columnId, filterValue) => {
        const count = row.original._count.products
        return String(count).includes(String(filterValue))
      },
    },
    {
      accessorFn: (row) => format(new Date(row.createdAt), 'yyyy-MM-dd'),
      id: "createdAt",
      header: "Created At",
      meta: { size: "150px", align: "start", filterType: "date" },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return <span className="text-sm text-muted-foreground">{format(date, 'yyyy-MM-dd')}</span>
      },
      filterFn: (row, columnId, filterValue: string) => {
        if (!filterValue) return true
        const rowDate = format(new Date(row.original.createdAt), 'yyyy-MM-dd')
        const filterDate = format(new Date(filterValue), 'yyyy-MM-dd')
        return rowDate === filterDate
      },
    },
    {
      accessorFn: (row) => format(new Date(row.updatedAt), 'yyyy-MM-dd'),
      id: "updatedAt",
      header: "Updated At",
      meta: { size: "150px", align: "start", filterType: "date" },
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt)
        return <span className="text-sm text-muted-foreground">{format(date, 'yyyy-MM-dd')}</span>
      },
      filterFn: (row, columnId, filterValue: string) => {
        if (!filterValue) return true
        const rowDate = format(new Date(row.original.updatedAt), 'yyyy-MM-dd')
        const filterDate = format(new Date(filterValue), 'yyyy-MM-dd')
        return rowDate === filterDate
      },
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
        enableRowSelection={true}
        enablePagination={true}
        pageSize={10}
        enableContextMenu={true}
        isLoading={isLoading}
        actionConfig={{
          showView: false,
          showEdit: true,
          showDelete: true,
        }}
        onRowView={onViewClick}
        onRowEdit={onEditClick}
        onRowDelete={onDeleteClick}
        actions={(category) => (
          <ActionMenu
            row={category}
            onView={onViewClick}
            onEdit={onEditClick}
            onDelete={onDeleteClick}
            showView={false}
            showEdit={true}
            showDelete={true}
          />
        )}
        actionsColumnMeta={{ size: "56px", align: "center", header: "Actions" }}
      />
    </div>
  )
}