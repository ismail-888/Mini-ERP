"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { useExchangeRate } from "~/contexts/exchange-rate-context"

export function ExchangeRateHeader() {
  const { rate, updateRate } = useExchangeRate()
  const [isOpen, setIsOpen] = useState(false)
  const [newRate, setNewRate] = useState(rate.usdToLBP.toString())

  const handleSave = () => {
    const parsed = Number.parseFloat(newRate.replace(/,/g, ""))
    if (!Number.isNaN(parsed) && parsed > 0) {
      updateRate(parsed)
      setIsOpen(false)
    }
  }

  const formattedRate = new Intl.NumberFormat("en-US").format(rate.usdToLBP)

  return (
    <div className="flex items-center gap-3">
      {/* عرض السعر بشكل نظيف */}
      <div className="flex flex-col items-end leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Daily Rate</span>
        <span className="text-sm font-bold text-foreground tabular-nums">
          $1 = {formattedRate} <span className="text-[10px] text-muted-foreground">LBP</span>
        </span>
      </div>

      {/* حوار التحديث */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-full border-dashed hover:border-primary hover:text-primary transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Exchange Rate</DialogTitle>
            <DialogDescription>
              Set the current USD to LBP exchange rate for accurate pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="rate">Exchange Rate (LBP per $1 USD)</label>
              <Input
                id="rate"
                type="text"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="89,500"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}