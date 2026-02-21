import React from 'react'
import { BrandClient } from '~/components/dashboard/brand/brand-client'
import { getBrandsAction } from '~/server/actions/brand/brands-actions'

async function BrandPages() {
  const result = await getBrandsAction()
  const brands = result.success ? result.data || [] : []

  return (
    <div>
      <BrandClient initialBrands={brands} />
    </div>
  )
}

export default BrandPages