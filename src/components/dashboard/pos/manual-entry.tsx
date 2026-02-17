"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import type { Product } from "~/lib/types"

interface ManualEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (product: Product) => void;
}

export function ManualEntry({ open, onOpenChange, onAddItem }: ManualEntryProps) {
  const [manualPrice, setManualPrice] = useState("")
  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState("1")

  const quickAmounts = [1, 5, 10, 20, 50, 100]

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
        onAddItem(manualProduct)
      }

      // Reset and close
      setManualPrice("")
      setManualName("")
      setManualQty("1")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-3">
        <DialogHeader>
          <DialogTitle>Manual Entry</DialogTitle>
          <DialogDescription>
            Add a product without barcode by entering the price manually.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* Item Name (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="manualName" className="text-sm font-medium">
              Item Name (Optional)
            </label>
            <Input
              id="manualName"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Custom Item"
            />
          </div>

          {/* Price Input */}
          <div className="space-y-1.5">
            <label htmlFor="manualPrice" className="text-sm font-medium">
              Price (USD) *
            </label>
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
                className="h-11 text-base"
              >
                ${amount}
              </Button>
            ))}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label htmlFor="manualQty" className="text-sm font-medium">
              Quantity
            </label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  )
}
