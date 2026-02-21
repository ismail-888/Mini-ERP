"use client"

import { Eye, Pencil, Trash2 } from "lucide-react"

interface ContextMenuPosition {
  x: number
  y: number
}

interface ContextMenuProps<T = unknown> {
  position: ContextMenuPosition | null
  row: T
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (id: string) => void | Promise<void>
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  onClose?: () => void
}

export function ContextMenu<T extends { id?: string | number }>({
  position,
  row,
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  onClose,
}: ContextMenuProps<T>) {
  if (!position || !row) return null

  const handleClick = (callback?: (row: T) => void) => {
    callback?.(row)
    onClose?.()
  }

  return (
    <div
      className="z-50 rounded-md border bg-card shadow-md overflow-hidden"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: "translate(8px, 8px)",
        minWidth: 150,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {showView && onView && (
        <button
          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm"
          onClick={() => handleClick(onView)}
        >
          <Eye className="h-4 w-4" /> View
        </button>
      )}
      {showEdit && onEdit && (
        <button
          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm"
          onClick={() => handleClick(onEdit)}
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>
      )}
      {showDelete && onDelete && row.id !== undefined && (
        <button
          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm text-destructive"
          onClick={() => handleClick(() => { void onDelete(row.id as string) })}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      )}
    </div>
  )
}
