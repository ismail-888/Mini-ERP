"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ScanBarcode, ShoppingCart, X, Plus, Keyboard } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { ProductGrid } from "~/components/dashboard/pos/product-grid"
import { CartDrawer } from "~/components/dashboard/pos/cart-drawer"
import { BarcodeScanner } from "~/components/dashboard/pos/barcode-scanner"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"


export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [scannerOpen, setScannerOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [manualPrice, setManualPrice] = useState("")
  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState("1")
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

  const handleManualEntry = () => {
    const price = Number.parseFloat(manualPrice)
    const qty = Number.parseInt(manualQty) || 1

    if (price > 0) {
      // Create a temporary product for manual entry
      const manualProduct: Product = {
        id: `manual-${Date.now()}`,
        name: manualName || "Custom Item",
        barcode: `MANUAL-${Date.now()}`,
        salePriceUSD: price,
        costPriceUSD: price * 0.7, // Estimated cost
        currentStock: 999,
        minStockAlert: 0,
        categoryId: null,
        category: null,
        brandId: null,
        brand: null,
      }

      // Add the item multiple times based on quantity
      for (let i = 0; i < qty; i++) {
        addItem(manualProduct)
      }

      // Reset and close
      setManualPrice("")
      setManualName("")
      setManualQty("1")
      setManualEntryOpen(false)
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

  // Quick keypad values
  const quickAmounts = [1, 5, 10, 20, 50, 100]

  return (
    <div className="flex h-[calc(100vh-3.5rem-5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row">
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="border-b border-border bg-card p-4">
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
              <SheetContent side="right" className="w-full p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border px-4 py-3">
                  <SheetTitle>Current Cart</SheetTitle>
                </SheetHeader>
                <CartDrawer onClose={() => setCartOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <ProductGrid products={displayedProducts} />
          )}
        </div>
      </div>

      {/* Desktop Cart Sidebar */}
      <aside className="hidden w-96 border-l border-border bg-card lg:block">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Current Cart</h2>
        </div>
        <CartDrawer />
      </aside>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanned={handleBarcodeScanned}
      />

      {/* Manual Entry Modal */}
      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="sm:max-w-md p-2">
          <DialogHeader>
            <DialogTitle>Manual Entry</DialogTitle>
            <DialogDescription>
              Add a product without barcode by entering the price manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Item Name (Optional) */}
            <div className="space-y-2">
              <label htmlFor="manualName">Item Name (Optional)</label>
              <Input
                id="manualName"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Custom Item"
              />
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label htmlFor="manualPrice">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="manualPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 text-lg"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  onClick={() => setManualPrice(amount.toString())}
                  className="h-12 text-lg"
                >
                  ${amount}
                </Button>
              ))}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label htmlFor="manualQty">Quantity</label>
              <Input
                id="manualQty"
                type="number"
                min="1"
                value={manualQty}
                onChange={(e) => setManualQty(e.target.value)}
                className="text-center"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setManualEntryOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualEntry}
              disabled={!manualPrice || Number.parseFloat(manualPrice) <= 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
