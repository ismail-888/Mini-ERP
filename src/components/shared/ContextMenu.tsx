"use client"

import { Eye, Pencil, Trash2 } from "lucide-react"

interface ContextMenuPosition {
  x: number
  y: number
}

interface ContextMenuProps {
  position: ContextMenuPosition | null
  row: any
  onView?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (id: string) => void | Promise<void>
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  onClose?: () => void
}

export function ContextMenu({
  position,
  row,
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  onClose,
}: ContextMenuProps) {
  if (!position || !row) return null

  const handleClick = (callback?: (row: any) => void) => {
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
      {showDelete && onDelete && (
        <button
          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 text-sm text-destructive"
          onClick={() => handleClick(() => onDelete(row.id))}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      )}
    </div>
  )
}
