"use client"

import { useState } from "react"
import { RefreshCw, DollarSign } from "lucide-react"
import { Button } from "~/components/ui/button"
import { ThemeToggle } from "~/components/theme-toggle"
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-card/95 backdrop-blur-lg">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">Mousahib</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Daily Rate</span>
            <span className="text-sm font-semibold text-foreground">
              $1 = {formattedRate} LBP
            </span>
          </div>

          <ThemeToggle />

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Update</span>
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
                  <label htmlFor="rate" className="text-sm font-medium text-muted-foreground">
                    USD to LBP
                  </label>
                  <Input
                    id="rate"
                    type="text"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    placeholder="89,500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Rate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
