import React from 'react'
import { CategoryClient } from '~/components/dashboard/category/category-client'
import { getCategoriesAction } from '~/server/actions/category/categories-actions'

async function CategoryPage() {
  const result = await getCategoriesAction()
  const categories = result.success ? result.data || [] : []

  return (
    <div>
      <CategoryClient initialCategories={categories} />
    </div>
  )
}

export default CategoryPage