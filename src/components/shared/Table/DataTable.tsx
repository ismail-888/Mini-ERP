import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Column as TableColumnType,
  Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

// Shadcn UI + Tailwind imports - adjust paths to your project's UI exports
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import BulkActionsBar from "./BulkActionsBar";
import TablePagination from "./TablePagination";

type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  tableName: string;
  onAddClick?: () => void;
  rightActions?: React.ReactNode;
  onRowRightClick?: (row: TData, e?: React.MouseEvent) => void;
  /**
   * Estimated/fixed row height in px. If you want the virtualizer to
   * measure rows dynamically, omit this prop. Default: 50
   */
  rowHeight?: number;
  /**
   * Maximum height of the scroll viewport (px). Defaults to 600.
   */
  maxHeight?: number;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
};

function FilterInput<TData, TValue>({
  column,
  placeholder,
}: {
  column: TableColumnType<TData, TValue>;
  placeholder?: string;
}) {
  const current = (column.getFilterValue?.() ?? "") as string;
  const [value, setValue] = React.useState<string>(current);

  React.useEffect(() => {
    setValue(current);
  }, [current]);

  // Debounce changes to avoid re-rendering on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => {
      column.setFilterValue?.(value || undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [value, column]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        placeholder={placeholder ?? "Search..."}
        className="mt-1 h-8 text-sm bg-white pr-8"
      />
      {value && (
        <button
          aria-label="Clear filter"
          onClick={(e) => {
            e.stopPropagation();
            setValue("");
            column.setFilterValue?.(undefined);
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function DataTable<TData>({
  data,
  columns,
  tableName,
  onAddClick,
  rightActions,
  onRowRightClick,
  rowHeight = 50,
  maxHeight = 600,
  enableRowSelection = false,
  enablePagination = false,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});


  // Build table columns - add selection column if enabled
  const tableColumns = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    let c = columns
    if (enableRowSelection) {
      const selectCol: ColumnDef<TData, unknown> = {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="border border-border dark:border-slate-600 ml-2"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | "indeterminate") => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="border border-border dark:border-slate-600"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { size: "50px", align: "center" },
      }
      c = [selectCol, ...c]
    }
    return c
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: false,
    ...(enablePagination ? { initialState: { pagination: { pageSize } } } : {}),
  })

  // rows for virtualizer / rendering
  const rows = table.getRowModel().rows
  const parentRef = React.useRef<HTMLDivElement | null>(null)

  const rowRefs = React.useRef<Map<number, HTMLTableRowElement>>(new Map())
  const measuredHeights = React.useRef<Map<number, number>>(new Map())

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current as HTMLElement | null,
    estimateSize: (index) => measuredHeights.current.get(index) ?? rowHeight,
    overscan: 6,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualRows.at(0)?.start ?? 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0

  // Measure newly rendered rows
  React.useEffect(() => {
    if (virtualRows.length === 0) return
    const raf = requestAnimationFrame(() => {
      let changed = false
      virtualRows.forEach((virtualRow) => {
        const el = rowRefs.current.get(virtualRow.index)
        if (el && !measuredHeights.current.has(virtualRow.index)) {
          const h = el.getBoundingClientRect().height
          if (h > 0) {
            measuredHeights.current.set(virtualRow.index, h)
            changed = true
          }
        }
      })
      if (changed) virtualizer.measure()
    })
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virtualRows.length])

  // selected rows for bulk actions
  const selectedCount = table.getSelectedRowModel().rows.length
  const handleClearSelection = React.useCallback(() => table.resetRowSelection(), [table])
  const handleDeleteSelected = React.useCallback(() => {
    const selected = table.getSelectedRowModel().rows.map((r) => r.original)
    console.log("Delete selected:", selected)
    table.resetRowSelection()
  }, [table])

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold px-2 py-1">{tableName}</h2>
        <div className="flex items-center gap-2">
          {rightActions}
          {onAddClick && (
            <Button onClick={onAddClick} variant="default" size="sm">
              Add
            </Button>
          )}
        </div>
      </div>
      {/* Bulk actions */}
      <BulkActionsBar selectedCount={selectedCount} onClearSelection={handleClearSelection} onDeleteSelected={handleDeleteSelected} />

      {/* Table container */}
      <div className="w-full border rounded-md overflow-x-auto">
        <div style={{ minWidth: "100%" }}>
          <div
            ref={parentRef}
            className="w-full overflow-auto"
            style={{ maxHeight }}
          >
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50 dark:bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const column = header.column
                      const isSelect = column.id === "select"
                      const isActions = column.id === "actions"
                      const isAvatar = column.id === "avatar"
                      const colMeta = column.columnDef.meta as Record<string, unknown> | undefined
                      const width = typeof colMeta?.size === "string" ? colMeta.size : undefined
                      return (
                        <th
                          key={header.id}
                          className={`text-left align-top px-2 py-1 border-b border-border`}
                          style={{
                            width,
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between h-8">
                              {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                <button
                                  className="flex items-center gap-2 text-sm font-medium"
                                  onClick={() => {
                                    header.column.toggleSorting()
                                  }}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {header.column.getIsSorted() === "asc" ? "▲" : header.column.getIsSorted() === "desc" ? "▼" : "⇵"}
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </div>
                              )}
                            </div>
                            {!header.isPlaceholder && !isSelect && !isActions && !isAvatar && (
                              <div>
                                <FilterInput column={column} />
                              </div>
                            )}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-card">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1} className="h-24 text-center px-3 py-2">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm text-muted-foreground">No results found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {paddingTop > 0 && (
                      <tr>
                        <td colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1} style={{ height: paddingTop, padding: 0, border: 'none' }} />
                      </tr>
                    )}

                    {virtualRows.map((virtualRow) => {
                      const row = rows[virtualRow.index]
                      if (!row) return null
                      return (
                        <tr
                          key={row.id}
                          ref={(el) => {
                            if (el) {
                              rowRefs.current.set(virtualRow.index, el)
                            } else {
                              rowRefs.current.delete(virtualRow.index)
                            }
                          }}
                          data-index={virtualRow.index}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onRowRightClick?.(row.original, e);
                          }}
                          className="border-b border-border hover:bg-muted/50"
                        >
                          {row.getVisibleCells().map((cell) => {
                            const col = cell.column
                            const isSelect = col.id === "select"
                            const isActions = col.id === "actions"
                            const meta = col.columnDef.meta as Record<string, unknown> | undefined
                            const align = (meta?.align as string) ?? "start"
                            const textAlign = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
                            return (
                              <td
                                key={cell.id}
                                className={`px-3 py-2 align-middle ${isSelect ? "w-12.5" : ""} ${isActions ? "w-20" : ""} ${textAlign}`}
                              >
                                <div className={!isSelect && !isActions ? "truncate" : undefined}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    {paddingBottom > 0 && (
                      <tr>
                        <td colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1} style={{ height: paddingBottom, padding: 0, border: 'none' }} />
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {enablePagination && table.getPageCount && table.getPageCount() > 0 && (
            <TablePagination table={table} pageSizeOptions={pageSizeOptions} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DataTable;

