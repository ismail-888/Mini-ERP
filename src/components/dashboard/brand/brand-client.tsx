'use client'

import React, { useEffect, useState } from 'react'
import { DeleteModal } from '~/components/shared/DeleteModal'

import { toast } from 'sonner'
import { bulkDeleteBrandsAction, deleteBrandAction, getBrandsAction } from '~/server/actions/brand/brands-actions'
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

export function BrandClient() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>(undefined)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingIds, setDeletingIds] = useState<string[] | null>(null)
  const [deletingName, setDeletingName] = useState<string | undefined>(undefined)
  const [deletingCount, setDeletingCount] = useState<number>(1)

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const result = await getBrandsAction()
      if (result.success) {
        setBrands(result.data || [])
      } else {
        toast.error(result.error || 'Failed to fetch brands')
      }
    } catch (error) {
      toast.error('Error fetching brands')
    } finally {
      setLoading(false)
    }
  }

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
      if (deletingIds.length === 1) {
        const brandId = deletingIds[0]
        if (!brandId) return
        const result = await deleteBrandAction(brandId)
        if (result.success) {
          toast.success('Brand deleted successfully')
        } else {
          toast.error(result.error || 'Failed to delete brand')
        }
      } else {
        const result = await bulkDeleteBrandsAction(deletingIds)
        if (result.success) {
          toast.success(`${deletingIds.length} brands deleted successfully`)
        } else {
          toast.error(result.error || 'Failed to delete brands')
        }
      }
      await fetchBrands()
    } catch (err) {
      console.error('Delete error', err)
      toast.error('Error deleting brands')
    } finally {
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
      />

      <AddBrandDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        brand={editingBrand}
        mode={editingBrand ? "edit" : "add"}
        onAdd={async () => {
          // refresh list after add
          await fetchBrands()
          setDialogOpen(false)
        }}
        onEdit={async () => {
          // refresh list after edit
          await fetchBrands()
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
