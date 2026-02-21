'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeleteModal } from '~/components/shared/DeleteModal'

import { toast } from 'sonner'
import { bulkDeleteBrandsAction, deleteBrandAction } from '~/server/actions/brand/brands-actions'
import { BrandTable } from './brand-table'
import AddBrandDialog from './add-brand-dialog'


interface Brand {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  _count: {
    products: number
  }
}

interface BrandClientProps {
  initialBrands: Brand[]
}

export function BrandClient({ initialBrands }: BrandClientProps) {
  const router = useRouter()
  // Use props as the source of truth
  const brands = initialBrands

  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>(undefined)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingIds, setDeletingIds] = useState<string[] | null>(null)
  const [deletingName, setDeletingName] = useState<string | undefined>(undefined)
  const [deletingCount, setDeletingCount] = useState<number>(1)

  const handleAddClick = () => {
    setEditingBrand(undefined)
    setDialogOpen(true)
  }

  const handleEditClick = (brand: Brand) => {
    setEditingBrand(brand)
    setDialogOpen(true)
  }

  const handleViewClick = (brand: Brand) => {
    // TODO: Open view brand dialog
    toast.info(`View brand: ${brand.name}`)
  }

  const handleDeleteClick = async (brandId: string) => {
    setDeletingIds([brandId])
    const brand = brands.find((b) => b.id === brandId)
    setDeletingName(brand?.name)
    setDeletingCount(1)
    setDeleteModalOpen(true)
  }

  const handleBulkDelete = async (brandIds: string[]) => {
    setDeletingIds(brandIds)
    setDeletingName(undefined)
    setDeletingCount(brandIds.length)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingIds || deletingIds.length === 0) return

    try {
      setLoading(true)
      if (deletingIds.length === 1) {
        const brandId = deletingIds[0]
        if (!brandId) return
        const result = await deleteBrandAction(brandId)
        if (result.success) {
          toast.success('Brand deleted successfully')
          router.refresh()
        } else {
          toast.error(result.error ?? 'Failed to delete brand')
        }
      } else {
        const result = await bulkDeleteBrandsAction(deletingIds)
        if (result.success) {
          toast.success(`${deletingIds.length} brands deleted successfully`)
          router.refresh()
        } else {
          toast.error(result.error ?? 'Failed to delete brands')
        }
      }
    } catch (err) {
      console.error('Delete error', err)
      toast.error('Error deleting brands')
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
      <BrandTable
        brands={brands}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onViewClick={handleViewClick}
        onDeleteClick={handleDeleteClick}
        onBulkDelete={handleBulkDelete}
        isLoading={loading}
      />

      <AddBrandDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        brand={editingBrand}
        mode={editingBrand ? "edit" : "add"}
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
        title="Delete Brand"
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
        title="Delete Brands"
        itemCount={deletingCount}
      />
    </>
  )
}
