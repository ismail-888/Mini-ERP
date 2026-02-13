'use client'

import React, { useEffect, useState } from 'react'
import { CategoryTable } from '~/components/dashboard/category/category-table'
import AddCategoryDialog from '~/components/dashboard/category/add-category-dialog'
import { DeleteModal } from '~/components/shared/DeleteModal'
import { getCategoriesAction, deleteCategoryAction, bulkDeleteCategoriesAction } from '~/server/actions/category/categories-actions'
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

export function CategoryClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingIds, setDeletingIds] = useState<string[] | null>(null)
  const [deletingName, setDeletingName] = useState<string | undefined>(undefined)
  const [deletingCount, setDeletingCount] = useState<number>(1)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const result = await getCategoriesAction()
      if (result.success) {
        setCategories(result.data || [])
      } else {
        toast.error(result.error || 'Failed to fetch categories')
      }
    } catch (error) {
      toast.error('Error fetching categories')
    } finally {
      setLoading(false)
    }
  }

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
      if (deletingIds.length === 1) {
        const categoryId = deletingIds[0]
        if (!categoryId) return
        const result = await deleteCategoryAction(categoryId)
        if (result.success) {
          toast.success('Category deleted successfully')
        } else {
          toast.error(result.error || 'Failed to delete category')
        }
      } else {
        const result = await bulkDeleteCategoriesAction(deletingIds)
        if (result.success) {
          toast.success(`${deletingIds.length} categories deleted successfully`)
        } else {
          toast.error(result.error || 'Failed to delete categories')
        }
      }
      await fetchCategories()
    } catch (err) {
      console.error('Delete error', err)
      toast.error('Error deleting categories')
    } finally {
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
          // refresh list after add
          await fetchCategories()
          setDialogOpen(false)
        }}
        onEdit={async () => {
          // refresh list after edit
          await fetchCategories()
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
