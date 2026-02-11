'use client'

import React, { useEffect, useState } from 'react'
import { CategoryTable } from '~/components/dashboard/category/category-table'
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
    // TODO: Open add category dialog
    toast.info('Add category dialog will open here')
  }

  const handleEditClick = (category: Category) => {
    // TODO: Open edit category dialog
    toast.info(`Edit category: ${category.name}`)
  }

  const handleViewClick = (category: Category) => {
    // TODO: Open view category dialog
    toast.info(`View category: ${category.name}`)
  }

  const handleDeleteClick = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const result = await deleteCategoryAction(categoryId)
      if (result.success) {
        toast.success('Category deleted successfully')
        await fetchCategories()
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
    } catch (error) {
      toast.error('Error deleting category')
    }
  }

  const handleBulkDelete = async (categoryIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${categoryIds.length} categories?`)) return

    try {
      const result = await bulkDeleteCategoriesAction(categoryIds)
      if (result.success) {
        toast.success(`${categoryIds.length} categories deleted successfully`)
        await fetchCategories()
      } else {
        toast.error(result.error || 'Failed to delete categories')
      }
    } catch (error) {
      toast.error('Error deleting categories')
    }
  }

  return (
    <CategoryTable
      categories={categories}
      onAddClick={handleAddClick}
      onEditClick={handleEditClick}
      onViewClick={handleViewClick}
      onDeleteClick={handleDeleteClick}
      onBulkDelete={handleBulkDelete}
    />
  )
}
