"use client"

import { useRef, useEffect } from "react"
import { MessageCircle, Printer, Plus, Download, Store, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import html2canvas from "html2canvas"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const { formatUSD, formatLBP, rate } = useExchangeRate()
  const receiptRef = useRef<HTMLDivElement>(null)
  const hasShownToast = useRef(false)

  // استخراج البيانات
  const invoiceNumber = searchParams.get("invoiceNumber") || "N/A"
  const totalUSD = Number(searchParams.get("total")) || 0
  const changeUSD = Number(searchParams.get("change")) || 0
  const itemsRaw = searchParams.get("items")
  const items = itemsRaw ? JSON.parse(decodeURIComponent(itemsRaw)) : []

  // استخراج تنبيهات المخزون من الـ URL
  const lowStockRaw = searchParams.get("lowStock")
  const lowStockAlerts = lowStockRaw ? JSON.parse(decodeURIComponent(lowStockRaw)) : []

  useEffect(() => {
    if (hasShownToast.current) return
    hasShownToast.current = true

    toast.success("Payment Received!", {
      description: `Invoice #${invoiceNumber} has been recorded.`,
      duration: 4000,
    })

    // إطلاق مفرقعات النجاح
    const count = 200
    const defaults = { origin: { y: 0.7 }, zIndex: 1000 }
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
    }
    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }, [invoiceNumber])

  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  
  const handleThermalPrint = () => {
    const thermalHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              @page {
                  size: 80mm auto;
                  margin: 0;
              }
              
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: Arial, sans-serif;
                  font-size: 13.6px;
                  margin: 0;
                  padding: 5px;
                  width: 80mm;
                  background: white;
              }
              
              .header, .footer {
                  text-align: center;
                  margin-bottom: 5px;
              }
              
              .footer {
                  margin-top: 10px;
              }
              
              .info {
                  margin-bottom: 3px;
                  font-size: 14px;
              }
              
              .info-bold {
                  margin-bottom: 3px;
                  font-size: 14px;
                  font-weight: bold;
              }
              
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 5px;
              }
              
              th, td {
                  text-align: left;
                  border-bottom: 1px dashed #000;
                  padding: 2px 4px;
                  font-size: 12.6px;
              }
              
              th {
                  border-bottom: 1px solid #000;
                  font-weight: bold;
              }
              
              .total {
                  text-align: right;
                  margin-top: 5px;
                  font-weight: bold;
                  font-size: 14px;
              }
              
              .center {
                  text-align: center;
              }
              
              .right {
                  text-align: right;
              }
              
              .divider {
                  border-top: 1px dashed #000;
                  margin: 5px 0;
              }
              
              .logo {
                  text-align: center;
                  margin-bottom: 10px;
              }
              
              @media print {
                  body {
                      width: 80mm;
                  }
              }
          </meta>
      </head>
      <body>
          <div class="header">
              <div class="logo">
                  <div style="font-size: 24px;">🏪</div>
              </div>
              <h3>LUXURY BOUTIQUE</h3>
              <div class="info">Official Receipt</div>
          </div>

          <div class="divider"></div>

          <div class="info">Invoice #: ${invoiceNumber}</div>
          <div class="info">Date: ${timestamp}</div>

          <div class="divider"></div>

          <table>
              <thead>
                  <tr>
                      <th style="width: 50%;">Item</th>
                      <th style="width: 15%;">Qty</th>
                      <th style="width: 20%;">Price</th>
                      <th style="width: 15%;">Total</th>
                  </tr>
              </thead>
              <tbody>
                  ${items.map((item: any) => `
                      <tr>
                          <td>${item.name}</td>
                          <td class="center">${item.quantity}</td>
                          <td class="right">${formatUSD(item.price)}</td>
                          <td class="right">${formatUSD(item.price * item.quantity)}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>

          <div class="divider"></div>

          <div class="total">TOTAL (USD): ${formatUSD(totalUSD)}</div>
          <div class="total">TOTAL (LBP): ${formatLBP(totalUSD * rate)}</div>
          ${changeUSD > 0 ? `<div class="total">CHANGE: ${formatUSD(changeUSD)}</div>` : ''}

          <div class="footer">
              <div class="info">*** Thank You ***</div>
          </div>
      </body>
      </html>
    `

    // Create a new window for printing (better than iframe)
    const printWindow = window.open('', '', 'width=302,height=auto')
    if (!printWindow) {
      toast.error("Please allow popups to print receipts")
      return
    }

    printWindow.document.open()
    printWindow.document.write(thermalHTML)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        // Close after printing
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 250)
    }
  }

  // Save as image using html2canvas
  const handleSaveAsImage = async () => {
    if (!receiptRef.current) return
    
    toast.loading("Generating receipt image...", { id: "receipt-save" })
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      } as any)
      
      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `Invoice-${invoiceNumber}.png`
      link.click()
      
      toast.success("Receipt saved successfully!", { id: "receipt-save" })
    } catch (error) {
      console.error("Failed to generate image:", error)
      toast.error("Failed to save receipt. Please try printing instead.", { id: "receipt-save" })
    }
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
    <div className="flex h-full flex-col items-center justify-start bg-slate-50/50 dark:bg-slate-950">
      <div className="w-full max-w-md flex flex-col gap-3">

        {/* --- التحديث الجديد: صندوق تنبيهات المخزون المنخفض --- */}
        {lowStockAlerts.length > 0 && (
          <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 p-3 mb-1 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-xs mb-1 uppercase tracking-wider">
              <Plus className="h-3 w-3 rotate-45" /> Low Stock Warning
            </div>
            <ul className="text-[11px] text-orange-600 dark:text-orange-300 space-y-0.5">
              {lowStockAlerts.map((alert: string, idx: number) => (
                <li key={idx}>• {alert}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Modern Invoice/Receipt Card - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent print:overflow-visible">
          <div ref={receiptRef} className="rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 print:shadow-none">
            <Card className="border-none shadow-none overflow-hidden rounded-4xl dark:bg-slate-900">
              <CardContent className="p-4 space-y-4">
                
              {/* Brand Header */}
              <div className="flex flex-col items-center justify-center space-y-2 pb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-lg">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">LUXURY BOUTIQUE</h2>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Official Receipt</p>
                  </div>
                </div>

              {/* Meta Info Box */}

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 text-[11px]">
                  <div className="flex flex-col">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Invoice</span>
                    <span className="text-slate-900 dark:text-white font-mono text-sm">#{invoiceNumber}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Date</span>
                    <span className="text-slate-900 dark:text-white font-medium">{timestamp}</span>
                  </div>
                </div>

              {/* Items Table */}
              <div className="space-y-3">
                  <div className="grid grid-cols-12 px-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <div className="col-span-8">Description</div>
                    <div className="col-span-4 text-right">Total</div>
                  </div>
                  <div className="space-y-4">
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 items-start text-sm group">
                        <div className="col-span-8 flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                            {item.name}
                            {/* تمييز المنتج اليدوي بنقطة صغيرة إذا لم يكن له ID منتج حقيقي */}
                            {!item.productId && <span className="h-1 w-1 bg-slate-300 rounded-full" title="Manual Entry" />}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">{item.quantity} × {formatUSD(item.price)}</span>
                        </div>
                        <div className="col-span-4 text-right font-black text-slate-950 dark:text-white">
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
                  <div className="flex justify-between items-center px-2 py-1 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <span className="text-[11px] font-bold text-green-700 dark:text-green-500 uppercase">Change Due</span>
                    <div className="text-right">
                      <div className="font-black text-green-700 dark:text-green-400 leading-tight">{formatUSD(changeUSD)}</div>
                      <div className="text-[9px] font-bold text-green-600 opacity-70">{formatLBP(changeUSD * rate)}</div>
                    </div>
                  </div>
                )}

              {/* Footer Stamp */}
            <div className="pt-2 text-center">
                   <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em]">*** Thank You ***</p>
                </div>
              </CardContent>
          </Card>
        </div>
        </div>

        {/* Action Buttons - Modern Style - Fixed at bottom */}
        <div className="shrink-0 space-y-3">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={handleSaveAsImage}>
              <Download className="mr-2 h-4 w-4" /> Save
            </Button>
    
            <Button variant="outline" className="flex-1 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={handleThermalPrint}>
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