'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryTable } from '~/components/dashboard/category/category-table'
import AddCategoryDialog from '~/components/dashboard/category/add-category-dialog'
import { DeleteModal } from '~/components/shared/DeleteModal'
import { deleteCategoryAction, bulkDeleteCategoriesAction } from '~/server/actions/category/categories-actions'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  _count: {
    products: number
  }
}

interface CategoryClientProps {
  initialCategories: Category[]
}

export function CategoryClient({ initialCategories }: CategoryClientProps) {
  const router = useRouter()
  // We use the prop directly as the source of truth when using router.refresh()
  // But if we want optimistic updates or simple state management, we can sync state.
  // For simplicity and to rely on server data:
  const categories = initialCategories
  
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingIds, setDeletingIds] = useState<string[] | null>(null)
  const [deletingName, setDeletingName] = useState<string | undefined>(undefined)
  const [deletingCount, setDeletingCount] = useState<number>(1)

  const handleAddClick = () => {
    setEditingCategory(undefined)
    setDialogOpen(true)
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleViewClick = (category: Category) => {
    // TODO: Open view category dialog
    toast.info(`View category: ${category.name}`)
  }

  const handleDeleteClick = async (categoryId: string) => {
    setDeletingIds([categoryId])
    const cat = categories.find((c) => c.id === categoryId)
    setDeletingName(cat?.name)
    setDeletingCount(1)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = async (categoryIds: string[]) => {
    setDeletingIds(categoryIds)
    setDeletingName(undefined)
    setDeletingCount(categoryIds.length)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingIds || deletingIds.length === 0) return

    try {
      setLoading(true)
      if (deletingIds.length === 1) {
        const categoryId = deletingIds[0]
        if (!categoryId) return
        const result = await deleteCategoryAction(categoryId)
        if (result.success) {
          toast.success('Category deleted successfully')
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to delete category')
        }
      } else {
        const result = await bulkDeleteCategoriesAction(deletingIds)
        if (result.success) {
          toast.success(`${deletingIds.length} categories deleted successfully`)
          router.refresh()
        } else {
          toast.error(result.error || 'Failed to delete categories')
        }
      }
    } catch (err) {
      console.error('Delete error', err)
      toast.error('Error deleting categories')
    } finally {
      setLoading(false)
      setDeleteModalOpen(false)
      setDeletingIds(null)
      setDeletingName(undefined)
      setDeletingCount(1)
    }
  }

  return (
    <>
      <CategoryTable
        categories={categories}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onViewClick={handleViewClick}
        onDeleteClick={handleDeleteClick}
        onBulkDelete={handleBulkDelete}
        isLoading={loading}
      />

      <AddCategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        category={editingCategory}
        mode={editingCategory ? "edit" : "add"}
        onAdd={async () => {
          router.refresh()
          setDialogOpen(false)
        }}
        onEdit={async () => {
          router.refresh()
          setDialogOpen(false)
        }}
      />
      <DeleteModal
        open={deleteModalOpen && !!deletingIds && deletingIds.length === 1}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingIds(null)
          setDeletingName(undefined)
          setDeletingCount(1)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        itemName={deletingName}
      />

      <DeleteModal
        open={deleteModalOpen && !!deletingIds && deletingIds.length > 1}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingIds(null)
          setDeletingName(undefined)
          setDeletingCount(1)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Categories"
        itemCount={deletingCount}
      />
    </>
  )
}
