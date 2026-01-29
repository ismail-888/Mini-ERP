"use client"

import { useState } from "react"
import { Plus, Search, Upload, X, ChevronDown } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { ProductTable } from "~/components/dashboard/inventory/product-table"
import { AddProductDialog } from "~/components/dashboard/inventory/add-product-dialog"
import { ImportExcelModal } from "~/components/dashboard/inventory/import-excel-modal"
// import { AddProductDrawer } from "~/components/inventory/add-product-drawer" // Import AddProductDrawer
import { mockProducts, categories, brands } from "~/lib/mock-data"
import type { Product } from "~/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu"
import { Badge } from "~/components/ui/badge"

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock"

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

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
      selectedCategories.includes(product.category)

    return matchesSearch && matchesStock && matchesBrand && matchesCategory
  })

  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    }
    setProducts((prev) => [product, ...prev])
    setAddProductOpen(false)
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setStockFilter("all")
    setSelectedBrands([])
    setSelectedCategories([])
  }

  const hasActiveFilters =
    stockFilter !== "all" ||
    selectedBrands.length > 0 ||
    selectedCategories.length > 0

  const stats = {
    total: products.length,
    inStock: products.filter((p) => p.stock > p.minStockAlert).length,
    lowStock: products.filter(
      (p) => p.stock > 0 && p.stock <= p.minStockAlert
    ).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
          <Button onClick={() => setAddProductOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setStockFilter("all")}
          className={`rounded-lg border p-3 text-left transition-colors ${
            stockFilter === "all"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </button>
        <button
          type="button"
          onClick={() => setStockFilter("in-stock")}
          className={`rounded-lg border p-3 text-left transition-colors ${
            stockFilter === "in-stock"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold text-primary">{stats.inStock}</p>
          <p className="text-xs text-muted-foreground">In Stock</p>
        </button>
        <button
          type="button"
          onClick={() => setStockFilter("low-stock")}
          className={`rounded-lg border p-3 text-left transition-colors ${
            stockFilter === "low-stock"
              ? "border-warning bg-warning/5"
              : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold text-warning">{stats.lowStock}</p>
          <p className="text-xs text-muted-foreground">Low Stock</p>
        </button>
        <button
          type="button"
          onClick={() => setStockFilter("out-of-stock")}
          className={`rounded-lg border p-3 text-left transition-colors ${
            stockFilter === "out-of-stock"
              ? "border-destructive bg-destructive/5"
              : "border-border bg-card hover:border-muted-foreground"
          }`}
        >
          <p className="text-2xl font-bold text-destructive">
            {stats.outOfStock}
          </p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, barcodes, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Brand Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              Brand
              {selectedBrands.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1.5 text-xs"
                >
                  {selectedBrands.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Brand</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {brands.map((brand) => (
              <DropdownMenuCheckboxItem
                key={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              >
                {brand}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              Category
              {selectedCategories.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 min-w-5 px-1.5 text-xs"
                >
                  {selectedCategories.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.name}
                checked={selectedCategories.includes(cat.name)}
                onCheckedChange={() => toggleCategory(cat.name)}
              >
                {cat.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Clear filters
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {stockFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {stockFilter.replace("-", " ")}
              <button
                type="button"
                onClick={() => setStockFilter("all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedBrands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1">
              {brand}
              <button
                type="button"
                onClick={() => toggleBrand(brand)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="mb-3 text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Product Table */}
      <ProductTable products={filteredProducts} />

      {/* Add Product Dialog */}
      <AddProductDialog
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAdd={handleAddProduct}
      />

      {/* Import Excel Modal */}
      <ImportExcelModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
