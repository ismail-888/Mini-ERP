"use client"

import { CheckCircle2, MessageCircle, Printer, Home, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"

export default function SuccessPage() {
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const handleWhatsAppReceipt = () => {
    // In a real app, this would open WhatsApp with a pre-filled message
    const message = encodeURIComponent(
      `Thank you for your purchase!\n\nOrder: ${orderNumber}\nDate: ${timestamp}\n\nYour receipt is attached.`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handlePrintReceipt = () => {
    // In a real app, this would trigger thermal printer
    window.print()
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem-5rem)] flex-col items-center justify-center  lg:min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sale Complete!</h1>
          <p className="mt-2 text-muted-foreground">
            Transaction processed successfully
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Number</span>
                <span className="font-mono text-sm font-medium">{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date & Time</span>
                <span className="text-sm font-medium">{timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Completed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Actions */}
        <div className="mb-6 space-y-3">
          <Button
            size="lg"
            className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white"
            onClick={handleWhatsAppReceipt}
          >
            <MessageCircle className="h-5 w-5" />
            Send WhatsApp Receipt
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 bg-transparent"
            onClick={handlePrintReceipt}
          >
            <Printer className="h-5 w-5" />
            Print Thermal Receipt
          </Button>
        </div>

        {/* Navigation Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/pos">
              <Plus className="h-4 w-4" />
              New Sale
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
