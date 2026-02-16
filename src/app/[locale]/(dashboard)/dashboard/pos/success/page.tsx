"use client"

import { useRef, useEffect } from "react"
import { CheckCircle2, MessageCircle, Printer, Plus, Download, Store, ArrowRight, Share2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import html2canvas from "html2canvas"
import confetti from "canvas-confetti"
import { toast } from "sonner"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const { formatUSD, formatLBP, rate } = useExchangeRate()
  const receiptRef = useRef<HTMLDivElement>(null)

  const invoiceNumber = searchParams.get("invoiceNumber") || "N/A"
  const totalUSD = Number(searchParams.get("total")) || 0
  const changeUSD = Number(searchParams.get("change")) || 0
  const itemsRaw = searchParams.get("items")
  const items = itemsRaw ? JSON.parse(decodeURIComponent(itemsRaw)) : []

  useEffect(() => {
    // Show success toast
    toast.success("Payment Received!", {
      description: "Transaction completed successfully and records updated.",
      duration: 4000,
    });

    // تشغيل مفرقعات ناعمة واحترافية
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 1000 };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const shareAsImage = async () => {
    if (!receiptRef.current) return
    const canvas = await html2canvas(receiptRef.current, { 
      backgroundColor: "#ffffff", 
      scale: 3, // جودة فائقة للصور الاحترافية
      logging: false,
      useCORS: true 
    })
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `Invoice-${invoiceNumber}.png`
    link.click()
  }

  const handleWhatsAppReceipt = () => {
    const itemsList = items.map((i: any) => `• ${i.name} (x${i.quantity})`).join("\n")
    const message = encodeURIComponent(
      `*🧾 فاتورة دفع رقم: #${invoiceNumber}*\n` +
      `--------------------------\n` +
      `${itemsList}\n` +
      `--------------------------\n` +
      `💰 المجموع: ${formatUSD(totalUSD)}\n` +
      `💵 بالليرة: ${formatLBP(totalUSD * rate)}\n` +
      `📅 التاريخ: ${timestamp}\n` +
      `شكراً لثقتكم بنا! ✨`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  return (
    <div className="flex h-full flex-col items-center justify-start  bg-slate-50/50 dark:bg-slate-950 print:p-0 print:bg-white">
      <div className="w-full max-w-md flex flex-col gap-3">
        
        {/* Modern Invoice/Receipt Card - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent print:overflow-visible">
          <div ref={receiptRef} className="rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 print:shadow-none">
            <Card className="border-none shadow-none overflow-hidden rounded-4xl dark:bg-slate-900">
              <CardContent className="p-4 space-y-4">
              {/* Brand Header */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950">
                  <Store className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Luxury Boutique</h2>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Digital POS Terminal</p>
                </div>
              </div>

              {/* Meta Info Box */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 flex justify-between items-center text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex flex-col">
                  <span className="text-slate-400 dark:text-slate-500 font-normal uppercase tracking-tighter">Invoice No.</span>
                  <span className="text-slate-900 dark:text-white font-mono text-sm">#{invoiceNumber}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-slate-400 dark:text-slate-500 font-normal uppercase tracking-tighter">Date & Time</span>
                  <span className="text-slate-900 dark:text-white">{timestamp}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 px-1 text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
                  <div className="col-span-8">Product Description</div>
                  <div className="col-span-4 text-right">Subtotal</div>
                </div>
                <div className="space-y-3">
                  {items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 items-center text-sm">
                      <div className="col-span-8 flex flex-col leading-tight">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.quantity} x {formatUSD(item.price)}</span>
                      </div>
                      <div className="col-span-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatUSD(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Totals Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</span>
                  <span className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{formatUSD(totalUSD)}</span>
                </div>
                <div className="flex justify-between items-center rounded-xl bg-blue-50/50 dark:bg-blue-950/50 px-3 py-2">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Amount in LBP</span>
                  <span className="text-sm font-black text-blue-700 dark:text-blue-300">{formatLBP(totalUSD * rate)}</span>
                </div>
              </div>

              {changeUSD > 0 && (
                <div className="flex justify-between items-center px-3 py-1 text-sm">
                  <span className="text-slate-400 dark:text-slate-500">Change Returned</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatUSD(changeUSD)}</span>
                </div>
              )}

              {/* Footer Stamp */}
              <div className="flex flex-col items-center ">
                <div className="h-px w-full bg-linear-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent mb-2" />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Thank you for shopping with us today!</p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Action Buttons - Modern Style - Fixed at bottom */}
        <div className="shrink-0 space-y-3 print:hidden">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={shareAsImage}>
              <Download className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
          
          <Button className="w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#1fb356] text-white font-extrabold shadow-lg shadow-green-200 dark:shadow-green-900/30" onClick={handleWhatsAppReceipt}>
            <MessageCircle className="mr-2 h-5 w-5" /> Send via WhatsApp
          </Button>

          <Button asChild variant="ghost" className="w-full h-10 rounded-2xl font-bold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
            <Link href="/dashboard/pos">
              New Transaction <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}