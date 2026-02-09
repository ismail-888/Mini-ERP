"use client"

import { useState, useMemo } from "react"
import { Plus, Search, Upload, X, ChevronDown } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { ProductTable } from "~/components/dashboard/inventory/product-table"
import { AddProductDialog } from "~/components/dashboard/inventory/add-product-dialog"
import { ImportExcelModal } from "~/components/dashboard/inventory/import-excel-modal"

import { type Product } from "~/lib/types"
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

interface InventoryClientProps {
  initialProducts: Product[] 
}

export default function InventoryClient({ initialProducts }: InventoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

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

  // 2. Derive filter lists from the actual database results
  const dynamicBrands = useMemo(() => 
    Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[], 
  [products])

  const dynamicCategories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[], 
  [products])

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

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
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
    total: mappedProducts.length,
    inStock: mappedProducts.filter((p) => p.stock > p.minStockAlert).length,
    lowStock: mappedProducts.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length,
    outOfStock: mappedProducts.filter((p) => p.stock === 0).length,
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products and stock levels
          </p>
        </div>
        {/* <div className="flex gap-2">
          Buttons moved into the table header via ProductTable props
        </div> */}
      </div>

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

      {/* Filters Bar */}
      {/* <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, barcodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Brand {selectedBrands.length > 0 && <Badge variant="secondary" className="ml-1">{selectedBrands.length}</Badge>}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Brands</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dynamicBrands.map(brand => (
              <DropdownMenuCheckboxItem key={brand} checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)}>
                {brand}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Category {selectedCategories.length > 0 && <Badge variant="secondary" className="ml-1">{selectedCategories.length}</Badge>}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dynamicCategories.map(cat => (
              <DropdownMenuCheckboxItem key={cat} checked={selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)}>
                {cat}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear filters <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div> */}

      <ProductTable
        products={filteredProducts}
        onAddClick={() => setAddProductOpen(true)}
        rightActions={(
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
        )}
      />

      <AddProductDialog open={addProductOpen} onClose={() => setAddProductOpen(false)} onAdd={handleAddProduct} />
      <ImportExcelModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}