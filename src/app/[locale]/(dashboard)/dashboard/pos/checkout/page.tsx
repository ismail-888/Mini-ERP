"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Banknote, Wallet, Calculator } from "lucide-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { useCart } from "~/contexts/cart-context"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import { cn } from "~/lib/utils"

type PaymentMethod = "cash" | "card" | "split"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotalUSD, totalDiscountUSD, totalUSD, clearCart, getEffectivePrice } = useCart()
  const { formatUSD, formatLBP, convertToLBP, rate } = useExchangeRate()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [isProcessing, setIsProcessing] = useState(false)

  // Split payment amounts
  const [cashUSD, setCashUSD] = useState("")
  const [cashLBP, setCashLBP] = useState("")
  const [cardAmount, setCardAmount] = useState("")

  // Calculate payment totals and change
  const paymentCalc = useMemo(() => {
    const cashUSDValue = Number.parseFloat(cashUSD) || 0
    const cashLBPValue = Number.parseFloat(cashLBP.replace(/,/g, "")) || 0
    const cardValue = Number.parseFloat(cardAmount) || 0

    // Convert LBP to USD equivalent
    const cashLBPInUSD = cashLBPValue / rate

    const totalPaidUSD = cashUSDValue + cashLBPInUSD + cardValue
    const remainingUSD = totalUSD - totalPaidUSD
    const changeUSD = totalPaidUSD > totalUSD ? totalPaidUSD - totalUSD : 0

    return {
      totalPaidUSD,
      remainingUSD,
      changeUSD,
      changeLBP: changeUSD * rate,
      isComplete: remainingUSD <= 0.01, // small tolerance for floating point
    }
  }, [cashUSD, cashLBP, cardAmount, totalUSD, rate])

  const handleCheckout = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))
    clearCart()
    router.push("/dashboard/pos/success")
  }

  if (items.length === 0) {
    return (
      <div className="flex h-[calc(100vh-3.5rem-5rem)] flex-col items-center justify-center p-6 text-center lg:h-[calc(100vh-3.5rem)]">
        <p className="text-lg font-medium text-foreground">No items in cart</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add products to your cart first
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/pos">Go to POS</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl ">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/pos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Checkout</h1>
      </div>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => {
              const effectivePrice = getEffectivePrice(item)
              const hasDiscount = effectivePrice < item.salePriceUSD
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium">
                      {item.quantity}
                    </span>
                    <div>
                      <span className="text-sm">{item.name}</span>
                      {hasDiscount && (
                        <span className="ml-2 text-xs text-primary">
                          ({item.discountType === "fixed" ? `-$${item.discountValue}` : `-${item.discountValue}%`})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatUSD(effectivePrice * item.quantity)}
                  </span>
                </div>
              )
            })}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatUSD(subtotalUSD)}</span>
            </div>
            {totalDiscountUSD > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-primary">-{formatUSD(totalDiscountUSD)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-semibold">Total</span>
              <div className="text-right">
                <p className="text-xl font-bold">{formatUSD(totalUSD)}</p>
                <p className="text-sm text-muted-foreground">
                  {formatLBP(convertToLBP(totalUSD))}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "cash", label: "Cash", icon: Banknote },
              { id: "card", label: "Card", icon: CreditCard },
              { id: "split", label: "Split", icon: Wallet },
            ].map((method) => {
              const Icon = method.icon
              const isSelected = paymentMethod === method.id
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {method.label}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Split Payment UI */}
      {paymentMethod === "split" && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" />
              Split Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Cash USD */}
              <div className="space-y-2">
                <label htmlFor="cashUSD">Cash (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="cashUSD"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashUSD}
                    onChange={(e) => setCashUSD(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              {/* Cash LBP */}
              <div className="space-y-2">
                <label htmlFor="cashLBP">Cash (LBP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    LBP
                  </span>
                  <Input
                    id="cashLBP"
                    type="text"
                    value={cashLBP}
                    onChange={(e) => setCashLBP(e.target.value)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Card */}
              <div className="space-y-2">
                <label htmlFor="cardAmount">Card (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="cardAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              <Separator />

              {/* Payment Summary */}
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-medium">
                    {formatUSD(paymentCalc.totalPaidUSD)}
                  </span>
                </div>
                {paymentCalc.remainingUSD > 0.01 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-destructive">
                      {formatUSD(paymentCalc.remainingUSD)}
                    </span>
                  </div>
                )}
                {paymentCalc.changeUSD > 0 && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="font-medium">Change Due</span>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatUSD(paymentCalc.changeUSD)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({formatLBP(paymentCalc.changeLBP)})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Sale Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        disabled={
          isProcessing ||
          (paymentMethod === "split" && !paymentCalc.isComplete)
        }
      >
        {isProcessing
          ? "Processing..."
          : paymentMethod === "split" && !paymentCalc.isComplete
            ? `Remaining: ${formatUSD(paymentCalc.remainingUSD)}`
            : `Complete Sale - ${formatUSD(totalUSD)}`}
      </Button>

      {/* Quick Change Calculator for Cash */}
      {paymentMethod === "cash" && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="h-4 w-4" />
              Quick Change Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="quickCashUSD">Customer Paid (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="quickCashUSD"
                    type="number"
                    step="1"
                    min="0"
                    value={cashUSD}
                    onChange={(e) => setCashUSD(e.target.value)}
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label>Change Due</label>
                <div className="flex h-10 items-center rounded-md bg-muted px-3">
                  {paymentCalc.changeUSD > 0 ? (
                    <div>
                      <span className="font-bold text-primary">
                        {formatUSD(paymentCalc.changeUSD)}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({formatLBP(paymentCalc.changeLBP)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
