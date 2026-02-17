"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ScanBarcode, ShoppingCart, X, Keyboard } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { ProductGrid } from "~/components/dashboard/pos/product-grid"
import { CartDrawer } from "~/components/dashboard/pos/cart-drawer"
import { BarcodeScanner } from "~/components/dashboard/pos/barcode-scanner"
import { ManualEntry } from "~/components/dashboard/pos/manual-entry"
import { useCart } from "~/contexts/cart-context"
import { getInventoryAction } from "~/server/actions/product/get-products"
import type { Product } from "~/lib/types"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"


export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [scannerOpen, setScannerOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const { itemCount, addItem } = useCart()

  // Fetch all products once on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const result = await getInventoryAction()
      if (result.success && result.data) {
        setProducts(result.data)
      }
      setLoading(false)
    }
    void fetchProducts()
  }, [])

  // Client-side filtering for instant response
 const filteredProducts = useMemo(() => {
  const query = searchQuery.toLowerCase();
  return products.filter((product) => {
    const brandName = typeof product.brand === 'object' ? product.brand?.name : '';
    return (
      product.name.toLowerCase().includes(query) ||
      product.barcode?.includes(query) ||
      brandName?.toLowerCase().includes(query)
    );
  });
}, [products, searchQuery]);

  // Only render first 40 products for optimal performance
  const displayedProducts = filteredProducts.slice(0, 40)

  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode)
    if (product) {
      addItem(product)
      setScannerOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && searchQuery) {
    const product = products.find(p => p.barcode === searchQuery);
    if (product) {
      addItem(product);
      setSearchQuery(""); // امسح البحث فوراً ليكون جاهزاً للقطعة التالية
      e.preventDefault();
    }
  }
};

  return (
    <div className="-m-4 -mb-24 lg:-m-6 lg:-mb-6 h-[calc(100vh-4rem)] overflow-hidden flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        {/* Search Bar */}
        <div className="shrink-0 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 p-3 lg:p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, or scan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
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

            {/* Manual Entry Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setManualEntryOpen(true)}
              className="shrink-0"
              title="Manual Entry"
            >
              <Keyboard className="h-5 w-5" />
              <span className="sr-only">Manual Entry</span>
            </Button>

            {/* Scan Barcode Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScannerOpen(true)}
              className="shrink-0"
            >
              <ScanBarcode className="h-5 w-5" />
              <span className="sr-only">Scan Barcode</span>
            </Button>

            {/* Mobile Cart Button */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="relative shrink-0 lg:hidden"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Open Cart</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex flex-col w-full p-0 sm:max-w-md overflow-hidden">
                <SheetHeader className="shrink-0 border-b border-border px-4 py-3.5">
                  <SheetTitle className="text-base">Current Cart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <CartDrawer onClose={() => setCartOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-4 bg-background">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={displayedProducts} />
          )}
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <aside className="hidden w-96 border-l border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80 lg:flex lg:flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border p-5.5">
          <h2 className="text-base font-semibold">Current Cart</h2>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <CartDrawer />
        </div>
      </aside>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={handleBarcodeScanned}
      />

      {/* Manual Entry Modal */}
      <ManualEntry
        open={manualEntryOpen}
        onOpenChange={setManualEntryOpen}
        onAddItem={addItem}
      />
    </div>
  )
}
