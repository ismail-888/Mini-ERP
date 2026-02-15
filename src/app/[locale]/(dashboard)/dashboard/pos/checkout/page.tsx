"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Banknote, Wallet, Calculator } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { useCart } from "~/contexts/cart-context"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import { cn } from "~/lib/utils"
import { createSaleAction } from "~/server/actions/sales/create-sale"

type PaymentMethod = "cash" | "card" | "split"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotalUSD, totalDiscountUSD, totalUSD, clearCart, getEffectivePrice } = useCart()
  const { formatUSD, formatLBP, convertToLBP, rate } = useExchangeRate()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [isProcessing, setIsProcessing] = useState(false)

  const [cashUSD, setCashUSD] = useState("")
  const [cashLBP, setCashLBP] = useState("")
  const [cardAmount, setCardAmount] = useState("")

  // Calculate payment totals and change
const paymentCalc = useMemo(() => {
    const cashUSDValue = Number.parseFloat(cashUSD) || 0
    const cashLBPValue = Number.parseFloat(cashLBP.replace(/,/g, "")) || 0
    const cardValue = Number.parseFloat(cardAmount) || 0

    const cashLBPInUSD = cashLBPValue / rate
    const totalPaidUSD = cashUSDValue + cashLBPInUSD + cardValue
    const remainingUSD = totalUSD - totalPaidUSD
    const changeUSD = totalPaidUSD > totalUSD ? totalPaidUSD - totalUSD : 0

    return {
      totalPaidUSD,
      remainingUSD,
      changeUSD,
      changeLBP: changeUSD * rate,
      isComplete: remainingUSD <= 0.01,
    }
  }, [cashUSD, cashLBP, cardAmount, totalUSD, rate])

const handleCheckout = async () => {
    if (paymentMethod === "split" && !paymentCalc.isComplete) {
      toast.error("يرجى استكمال المبلغ المطلوب")
      return
    }

    setIsProcessing(true)
    
    const saleData = {
      items: items.map((item) => {
        const effectivePrice = getEffectivePrice(item)
        const discountPerItem = item.salePriceUSD - effectivePrice
        
        return {
          productId: item.id,
          quantity: item.quantity,
          originalPrice: item.salePriceUSD, // السعر قبل الخصم
          priceUSD: effectivePrice,         // السعر بعد الخصم
          discountApplied: discountPerItem, // قيمة الخصم
        }
      }),
      totalUSD: totalUSD,
      totalLBP: convertToLBP(totalUSD),
      exchangeRate: rate,
      paymentMethod: paymentMethod,
      // منطق توزيع المبالغ المدفوعة
      paidCashUSD: paymentMethod === "cash" ? (Number.parseFloat(cashUSD) || totalUSD) : (Number.parseFloat(cashUSD) || 0),
      paidCashLBP: Number.parseFloat(cashLBP.replace(/,/g, "")) || 0,
      paidCardUSD: paymentMethod === "card" ? totalUSD : (Number.parseFloat(cardAmount) || 0),
    }

    try {
      const result = await createSaleAction(saleData)

      if (result.success) {
        toast.success("تم تسجيل العملية بنجاح!")
        clearCart()
        // نمرر الـ id والـ invoiceNumber والـ change لصفحة النجاح
        router.push(
          `/dashboard/pos/success?id=${result.data.id}&invoiceNumber=${result.data.invoiceNumber}&total=${totalUSD}&change=${paymentCalc.changeUSD}`
        )
      } else {
        toast.error(result.error || "حدث خطأ ما")
      }
    } catch (error) {
      toast.error("فشل الاتصال بالخادم")
    } finally {
      setIsProcessing(false)
    }
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
 <div className="mx-auto max-w-2xl px-4 py-6 pb-24 lg:pb-6">
  {/* Header */}
  <div className="mb-6 flex items-center gap-4">
    <Button variant="ghost" size="icon" asChild>
      <Link href="/dashboard/pos">
        <ArrowLeft className="h-5 w-5" />
      </Link>
    </Button>
    <h1 className="text-xl font-bold">Checkout</h1>
  </div>

  {/* 1. Order Summary Card */}
  <Card className="mb-6 shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Order Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {items.map((item) => {
          const effectivePrice = getEffectivePrice(item);
          const hasDiscount = effectivePrice < item.salePriceUSD;
          return (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium">
                  {item.quantity}
                </span>
                <div>
                  <span className="text-sm">{item.name}</span>
                  {hasDiscount && (
                    <span className="ml-2 text-xs text-primary italic">
                      ({item.discountType === "fixed" ? `-$${item.discountValue}` : `-${item.discountValue}%`})
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium">{formatUSD(effectivePrice * item.quantity)}</span>
            </div>
          );
        })}
      </div>
      <Separator className="my-4" />
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatUSD(subtotalUSD)}</span>
        </div>
        {totalDiscountUSD > 0 && (
          <div className="flex justify-between text-primary">
            <span>Discount</span>
            <span>-{formatUSD(totalDiscountUSD)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t mt-2">
          <span className="text-lg font-bold">Total</span>
          <div className="text-right">
            <p className="text-xl font-black text-primary">{formatUSD(totalUSD)}</p>
            <p className="text-xs text-muted-foreground">{formatLBP(convertToLBP(totalUSD))}</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* 2. Payment Method Selector */}
  <Card className="mb-6 shadow-sm">
    <CardHeader className="pb-3 text-center">
      <CardTitle className="text-base">Choose Payment Method</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "cash", label: "Cash", icon: Banknote },
          { id: "card", label: "Card", icon: CreditCard },
          { id: "split", label: "Split", icon: Wallet },
        ].map((method) => {
          const isSelected = paymentMethod === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id as PaymentMethod)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-95",
                isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted hover:border-muted-foreground/50"
              )}
            >
              <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs font-bold uppercase", isSelected ? "text-primary" : "text-foreground")}>{method.label}</span>
            </button>
          );
        })}
      </div>
    </CardContent>
  </Card>

  {/* 3. Dynamic Payment Inputs (Cleaned up logic) */}
  {paymentMethod === "split" ? (
    <Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calculator className="h-4 w-4" /> Split Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Cash (USD)</label>
            <Input type="number" value={cashUSD} onChange={(e) => setCashUSD(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Cash (LBP)</label>
            <Input type="text" value={cashLBP} onChange={(e) => setCashLBP(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium">Card Amount (USD)</label>
            <Input type="number" value={cardAmount} onChange={(e) => setCardAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        
        <div className="rounded-lg bg-background p-3 border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Paid: {formatUSD(paymentCalc.totalPaidUSD)}</span>
            <span className={cn("font-bold", paymentCalc.isComplete ? "text-green-600" : "text-destructive")}>
              {paymentCalc.isComplete ? "Fully Paid" : `Remaining: ${formatUSD(paymentCalc.remainingUSD)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : paymentMethod === "cash" ? (
    <Card className="mb-6 shadow-sm border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
           <Calculator className="h-4 w-4" /> Quick Change Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs">Received (USD)</label>
          <Input type="number" value={cashUSD} onChange={(e) => setCashUSD(e.target.value)} placeholder={totalUSD.toString()} />
        </div>
        <div className="space-y-1">
          <label className="text-xs">Change Due</label>
          <div className="h-10 flex items-center font-bold text-primary">
            {paymentCalc.changeUSD > 0 ? formatUSD(paymentCalc.changeUSD) : "-"}
          </div>
        </div>
      </CardContent>
    </Card>
  ) : null}

  {/* 4. Final Action Button */}
  <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 lg:relative lg:border-none lg:p-0">
    <Button
      size="lg"
      className="w-full text-lg font-bold shadow-xl"
      onClick={handleCheckout}
      disabled={isProcessing || (paymentMethod === "split" && !paymentCalc.isComplete)}
    >
      {isProcessing ? "Processing Sale..." : `Confirm Payment - ${formatUSD(totalUSD)}`}
    </Button>
  </div>
</div>
  )
}
