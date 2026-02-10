"use client"

import { useState, useMemo } from "react"
import { Upload} from "lucide-react"
import { Button } from "~/components/ui/button"
import { ProductTable } from "~/components/dashboard/inventory/product-table"
import { AddProductDialog } from "~/components/dashboard/inventory/add-product-dialog"
import { ImportExcelModal } from "~/components/dashboard/inventory/import-excel-modal"
import { DeleteModal } from "~/components/shared/DeleteModal"
import ViewProductDialog from "~/components/dashboard/inventory/view-product-dialog"
import { deleteProductAction, bulkDeleteProductsAction, getProductByIdAction } from "~/server/actions/get-products"
import { toast } from "sonner"
import { type Product } from "~/lib/types"

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock"

interface InventoryClientProps {
  initialProducts: Product[] 
}

export default function InventoryClient({ initialProducts }: InventoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<"single" | "bulk">("single")
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [deleteBulkIds, setDeleteBulkIds] = useState<string[]>([])
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewProductId, setViewProductId] = useState<string | null>(null)

  // 1. Map Prisma fields to UI names so the filtering/logic below stays clean
  const mappedProducts = useMemo(() => {
    return products.map(p => ({
      ...p,
      stock: p.currentStock,
      priceUSD: p.salePriceUSD,
      costUSD: p.costPriceUSD,
      // Handle nulls for string-based filtering
      displayBrand: p.brand ?? "No Brand",
      displayCategory: p.category ?? "Uncategorized"
    }))
  }, [products])

  const filteredProducts = mappedProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode?.includes(searchQuery)) ??
      (product.category?.toLowerCase().includes(searchQuery.toLowerCase())) ??
      (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && product.stock > product.minStockAlert) ||
      (stockFilter === "low-stock" &&
        product.stock > 0 &&
        product.stock <= product.minStockAlert) ||
      (stockFilter === "out-of-stock" && product.stock === 0)

    const matchesBrand =
      selectedBrands.length === 0 ||
      (product.brand && selectedBrands.includes(product.brand))

    const matchesCategory =
      selectedCategories.length === 0 ||
      (product.category && selectedCategories.includes(product.category))

    return matchesSearch && matchesStock && matchesBrand && matchesCategory
  })

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev])
    setAddProductOpen(false)
  }

  const handleEditClick = (product: Product) => {
    // Open dialog immediately
    setAddProductOpen(true)
    setEditingProduct(null)
    setLoadingEdit(true)
    
    // Fetch product data in background
    getProductByIdAction(product.id)
      .then((result) => {
        if (result.success && result.data) {
          setEditingProduct(result.data)
        } else {
          toast.error(result.error || "Failed to load product")
        }
      })
      .catch((error) => {
        console.error("Error loading product:", error)
        toast.error("Failed to load product")
      })
      .finally(() => {
        setLoadingEdit(false)
      })
  }

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    )
    setEditingProduct(null)
  }

  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setProductToDelete(product || null)
    setDeleteProductId(productId)
    setDeleteType("single")
    setDeleteModalOpen(true)
  }

  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    
    try {
      const result = await deleteProductAction(deleteProductId);
      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteProductId));
        toast.success("Product deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  }

  const handleBulkDeleteProducts = (productIds: string[]) => {
    setDeleteBulkIds(productIds)
    setDeleteType("bulk")
    setDeleteModalOpen(true)
  }

  const handleViewClick = (product: Product) => {
    setViewProductId(product.id)
    setViewOpen(true)
  }

  const handleConfirmBulkDelete = async () => {
    if (deleteBulkIds.length === 0) return;
    
    try {
      const result = await bulkDeleteProductsAction(deleteBulkIds);
      if (result.success) {
        setProducts((prev) => prev.filter((p) => !deleteBulkIds.includes(p.id)));
        toast.success(`${deleteBulkIds.length} products deleted successfully`);
      } else {
        toast.error(result.error || "Failed to delete products");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete products");
    }
  }

  const stats = {
    total: mappedProducts.length,
    inStock: mappedProducts.filter((p) => p.stock > p.minStockAlert).length,
    lowStock: mappedProducts.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length,
    outOfStock: mappedProducts.filter((p) => p.stock === 0).length,
  }

  return (
    <div className="">
      {/* Header */}
      {/* <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products and stock levels
          </p>
        </div>
      </div> */}

      {/* Stats Dashboard */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => setStockFilter("all")}
          className={`rounded-lg border p-3 text-left transition-all ${
            stockFilter === "all" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </button>
        <button
          onClick={() => setStockFilter("in-stock")}
          className={`rounded-lg border p-3 text-left transition-all ${
            stockFilter === "in-stock" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold text-primary">{stats.inStock}</p>
          <p className="text-xs text-muted-foreground">In Stock</p>
        </button>
        <button
          onClick={() => setStockFilter("low-stock")}
          className={`rounded-lg border p-3 text-left transition-all ${
            stockFilter === "low-stock" ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500" : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold text-orange-500">{stats.lowStock}</p>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </button>
        <button
          onClick={() => setStockFilter("out-of-stock")}
          className={`rounded-lg border p-3 text-left transition-all ${
            stockFilter === "out-of-stock" ? "border-destructive bg-destructive/5 ring-1 ring-destructive" : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </button>
      </div>


      <ProductTable
        products={filteredProducts}
        onAddClick={() => setAddProductOpen(true)}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteProduct}
        onViewClick={handleViewClick}
        onBulkDelete={handleBulkDeleteProducts}
        rightActions={(
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
        )}
      />

      <AddProductDialog 
        open={addProductOpen || !!editingProduct} 
        onClose={() => {
          setAddProductOpen(false)
          setEditingProduct(null)
        }} 
        onAdd={handleAddProduct}
        product={editingProduct ?? undefined}
        onEdit={handleEditProduct}
        isLoading={loadingEdit}
        mode={(loadingEdit || !!editingProduct) ? "edit" : "add"}
      />
      <ImportExcelModal open={importOpen} onClose={() => setImportOpen(false)} />
      
      <DeleteModal
        open={deleteModalOpen && deleteType === "single"}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteProductId(null)
          setProductToDelete(null)
        }}
        onConfirm={handleConfirmDeleteProduct}
        title="Delete Product"
        itemName={productToDelete?.name}
      />
      <DeleteModal
        open={deleteModalOpen && deleteType === "bulk"}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteBulkIds([])
        }}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Products"
        itemCount={deleteBulkIds.length}
      />
      <ViewProductDialog open={viewOpen} productId={viewProductId ?? undefined} onClose={() => { setViewOpen(false); setViewProductId(null) }} />
    </div>
  )
}