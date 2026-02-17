"use client"

import { useState, useEffect } from "react"
import { Plus, Tag, Truck, Settings } from "lucide-react"
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
import { Separator } from "~/components/ui/separator"

interface ManualEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (product: Product) => void;
}

export function ManualEntry({ open, onOpenChange, onAddItem }: ManualEntryProps) {
  const [manualPrice, setManualPrice] = useState("")
  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState("1")

  // Reset fields when dialog closes
  useEffect(() => {
    if (!open) {
      setManualPrice("")
      setManualName("")
      setManualQty("1")
    }
  }, [open])

  const quickAmounts = [1, 5, 10, 20, 50, 100]
  
  // اقتراحات سريعة للأسماء لتجنب الـ "Custom Item" المجهول
  const nameSuggestions = [
    { label: "Service", icon: Settings },
    { label: "Delivery", icon: Truck },
    { label: "Misc", icon: Tag },
  ]

  const handleManualEntry = () => {
    const price = Number.parseFloat(manualPrice)
    const qty = Number.parseInt(manualQty) || 1

    if (price > 0) {
      // النهج الأفضل: استخدام اسم وصفي إذا كان الحقل فارغاً
      const finalName = manualName.trim() || `Manual Item ($${price})`

      const manualProduct: Product = {
        id: `manual-${Date.now()}`,
        name: finalName,
        barcode: `MANUAL-${Date.now()}`,
        salePriceUSD: price,
        costPriceUSD: price * 0.7, // تكلفة تقديرية
        currentStock: 999,
        minStockAlert: 0,
        categoryId: null,
        category: null,
        brandId: null,
        brand: null,
      }

      for (let i = 0; i < qty; i++) {
        onAddItem(manualProduct)
      }

      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle>Manual Entry</DialogTitle>
          <DialogDescription>
            Add a service or a product not in your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* حقل السعر - وضعناه في البداية لأنه الأهم في الإدخال اليدوي */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-primary">Price (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input
                type="number"
                step="0.01"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder="0.00"
                className="pl-7 text-xl font-bold h-12 border-primary/20"
                autoFocus
              />
            </div>
          </div>

          {/* أزرار المبالغ السريعة */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="secondary"
                onClick={() => setManualPrice(amount.toString())}
                className="h-10"
              >
                +${amount}
              </Button>
            ))}
          </div>

          <Separator />

          {/* اسم المنتج مع اقتراحات */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Item Name / Description</label>
            <Input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="e.g. Repair Service, Delivery Fee..."
            />
            <div className="flex gap-2">
              {nameSuggestions.map((s) => (
                <Button
                  key={s.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setManualName(s.label)}
                >
                  <s.icon className="mr-1 h-3 w-3" />
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          {/* الكمية */}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={manualQty}
                onChange={(e) => setManualQty(e.target.value)}
                className="w-20 text-center font-bold"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleManualEntry}
            disabled={!manualPrice || Number.parseFloat(manualPrice) <= 0}
            className="flex-1 shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

