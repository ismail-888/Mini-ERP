"use client"

import { useRef, useEffect } from "react"
import { CheckCircle2, MessageCircle, Printer, Plus, Download, Store } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import html2canvas from "html2canvas"
import confetti from "canvas-confetti"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const { formatUSD, formatLBP, rate } = useExchangeRate()
  const receiptRef = useRef<HTMLDivElement>(null)

  // 1. جلب البيانات الأساسية
  const invoiceNumber = searchParams.get("invoiceNumber") || "N/A"
  const totalUSD = Number(searchParams.get("total")) || 0
  const changeUSD = Number(searchParams.get("change")) || 0
  
  // 2. جلب المنتجات (نفترض أنها مرسلة كـ JSON string)
  const itemsRaw = searchParams.get("items")
  const items = itemsRaw ? JSON.parse(decodeURIComponent(itemsRaw)) : []

  // تشغيل المفرقعات عند تحميل الصفحة
  useEffect(() => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const shareAsImage = async () => {
    if (!receiptRef.current) return
    const canvas = await html2canvas(receiptRef.current, { backgroundColor: "#ffffff", scale: 2 })
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `Receipt-${invoiceNumber}.png`
    link.click()
  }

  const handleWhatsAppReceipt = () => {
    const itemsList = items.map((i: any) => `${i.name} x${i.quantity}`).join("\n")
    const message = encodeURIComponent(
      `*🧾 فاتورة رقم: #${invoiceNumber}*\n` +
      `--------------------------\n` +
      `${itemsList}\n` +
      `--------------------------\n` +
      `💰 المجموع: ${formatUSD(totalUSD)}\n` +
      `💵 بالليرة: ${formatLBP(totalUSD * rate)}\n` +
      `--------------------------\n` +
      `شكراً لزيارتكم! ✨`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        <div className="mb-6 flex flex-col items-center text-center print:hidden">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-200">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Success!</h1>
          <p className="text-muted-foreground font-medium">Invoice generated and saved.</p>
        </div>

        {/* الـ Receipt الفعلي */}
        <div ref={receiptRef} className="bg-white p-2">
          <Card className="border-2 border-black shadow-none overflow-hidden font-mono">
            <CardContent className="py-8 space-y-6">
              {/* Logo & Header */}
              <div className="flex flex-col items-center space-y-1">
                <div className="p-2 bg-black rounded-lg mb-2">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest">MY COOL STORE</h2>
                <p className="text-[10px] text-center opacity-70">Beirut, Lebanon • +961 00 000 000</p>
              </div>

              <div className="border-y-2 border-black border-dashed py-2 flex justify-between text-[10px] font-bold">
                <span>INV: #{invoiceNumber}</span>
                <span>{timestamp}</span>
              </div>

              {/* قائمة المنتجات */}
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-50 px-1">
                  <span>Item Description</span>
                  <span>Total</span>
                </div>
                <Separator className="bg-black/10" />
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs items-start">
                    <div className="flex flex-col">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-[10px] opacity-70">
                        {item.quantity} x {formatUSD(item.price)}
                      </span>
                    </div>
                    <span className="font-bold">{formatUSD(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t-2 border-black pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase">Grand Total</span>
                  <span className="text-xl font-black">{formatUSD(totalUSD)}</span>
                </div>
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">LBP Total (@{rate.toLocaleString()})</span>
                  <span className="text-sm font-bold">{formatLBP(totalUSD * rate)}</span>
                </div>
              </div>

              {changeUSD > 0 && (
                <div className="bg-black text-white p-2 flex justify-between items-center rounded-sm">
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Change Due</span>
                  <span className="text-sm font-black">{formatUSD(changeUSD)}</span>
                </div>
              )}

              <div className="text-center pt-4">
                <div className="inline-block border-2 border-black px-4 py-1 text-[10px] font-black uppercase rotate-[-2deg]">
                  Paid - Thank You!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الأزرار */}
        <div className="mt-6 space-y-3 print:hidden">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="border-2 border-black font-bold h-12" onClick={shareAsImage}>
              <Download className="mr-2 h-4 w-4" /> Image
            </Button>
            <Button variant="outline" className="border-2 border-black font-bold h-12" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
          
          <Button className="w-full bg-[#25D366] hover:bg-[#1fb356] text-white font-black h-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black" onClick={handleWhatsAppReceipt}>
            <MessageCircle className="mr-2 h-5 w-5" /> Send WhatsApp Receipt
          </Button>

          <Button asChild variant="secondary" className="w-full font-bold h-12 border-2 border-black">
            <Link href="/dashboard/pos"> <Plus className="mr-2 h-4 w-4" /> Start New Sale </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}