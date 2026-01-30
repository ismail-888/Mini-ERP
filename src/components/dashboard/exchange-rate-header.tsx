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
    <div className="flex items-center gap-1.5 sm:gap-3">
      {/* عرض السعر بشكل متجاوب */}
      <div className="flex flex-col items-end leading-tight">
        {/* يختفي في الجوال ويظهر في sm فأكبر */}
        <span className="hidden sm:block text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          Daily Rate
        </span>
        
        <div className="flex items-center gap-1 text-sm font-bold text-foreground tabular-nums">
          {/* نص مختصر جداً للجوال: 1$ = 89k */}
          <span className="sm:hidden text-primary">$</span>
          <span className="hidden sm:inline">$1 =</span>
          <span>{formattedRate}</span>
          <span className="text-[10px] text-muted-foreground font-normal">LBP</span>
        </div>
      </div>

      {/* حوار التحديث */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-dashed hover:border-primary hover:text-primary transition-all shrink-0"
          >
            <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md rounded-lg">
          <DialogHeader className="text-start">
            <DialogTitle>Update Exchange Rate</DialogTitle>
            <DialogDescription>
              Set the current USD to LBP exchange rate for accurate pricing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="rate" className="text-sm font-medium">
                Exchange Rate (LBP per $1 USD)
              </label>
              <Input
                id="rate"
                type="text"
                inputMode="decimal" // لإظهار لوحة أرقام في الجوال
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="89,500"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none bg-primary text-primary-foreground">
              Save Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}