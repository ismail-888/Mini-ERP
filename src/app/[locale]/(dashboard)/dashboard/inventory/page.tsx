import { getInventoryAction } from "~/server/actions/product/get-products";
import InventoryClient from "~/components/dashboard/inventory/inventory-client";

export default async function InventoryPage() {
  const result = await getInventoryAction();
  
  // Use the nullish coalescing operator to guarantee an array
  const initialProducts = result.data ?? [];

  return (
    <div>
      <InventoryClient initialProducts={initialProducts} />
    </div>
  );
}