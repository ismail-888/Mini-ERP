import { getInventoryAction } from "~/server/actions/product/get-products";
import { getCategoriesAction } from "~/server/actions/category/categories-actions";
import { getBrandsAction } from "~/server/actions/brand/brands-actions";
import InventoryClient from "~/components/dashboard/inventory/inventory-client";

export default async function InventoryPage() {
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    getInventoryAction(),
    getCategoriesAction(),
    getBrandsAction(),
  ]);
  
  // Use the nullish coalescing operator to guarantee an array
  const initialProducts = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const brands = brandsResult.data ?? [];

  return (
    <div>
      <InventoryClient 
        initialProducts={initialProducts}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}