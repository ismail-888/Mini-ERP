import { getInventoryAction } from "~/server/actions/product/get-products"
import { PosClient } from "~/components/dashboard/pos/pos-client"

export default async function POSPage() {
  const result = await getInventoryAction()
  const initialProducts = result.success ? result.data ?? [] : []

  return (
    <PosClient initialProducts={initialProducts} />
  )
}
