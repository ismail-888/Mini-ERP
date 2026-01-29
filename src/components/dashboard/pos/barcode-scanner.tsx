"use client"

import React from "react"

import { useState } from "react"
import { Camera, ScanBarcode } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"


interface BarcodeScannerProps {
  open: boolean
  onClose: () => void
  onScanned: (barcode: string) => void
}

export function BarcodeScanner({ open, onClose, onScanned }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onScanned(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  const simulateScan = () => {
    setIsScanning(true)
    // Simulate scanning delay
    setTimeout(() => {
      // Randomly pick one of the mock barcodes
      const barcodes = [
        "1234567890123",
        "2345678901234",
        "3456789012345",
        "5678901234567",
      ]
      const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)]
      setIsScanning(false)
      onScanned(randomBarcode)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camera Preview Placeholder */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isScanning ? (
                <>
                  <div className="relative">
                    <Camera className="h-16 w-16 text-muted-foreground animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1 w-32 animate-scan bg-primary/50 rounded-full" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Scanning...
                  </p>
                </>
              ) : (
                <>
                  <Camera className="h-16 w-16 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Camera preview area
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (html5-qrcode integration placeholder)
                  </p>
                </>
              )}
            </div>

            {/* Scan Frame Overlay */}
            <div className="absolute inset-8 rounded-lg border-2 border-dashed border-primary/30" />
            <div className="absolute left-8 top-8 h-4 w-4 border-l-2 border-t-2 border-primary" />
            <div className="absolute right-8 top-8 h-4 w-4 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-8 left-8 h-4 w-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-8 right-8 h-4 w-4 border-b-2 border-r-2 border-primary" />
          </div>

          <Button
            onClick={simulateScan}
            disabled={isScanning}
            className="w-full"
            variant="secondary"
          >
            {isScanning ? "Scanning..." : "Simulate Scan (Demo)"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter manually
              </span>
            </div>
          </div>

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="barcode">Barcode Number</label>
              <Input
                id="barcode"
                placeholder="Enter barcode..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!manualBarcode.trim()}>
              Add Product
            </Button>
          </form>
        </div>

        <style jsx>{`
          @keyframes scan {
            0%, 100% { transform: translateY(-50px); }
            50% { transform: translateY(50px); }
          }
          :global(.animate-scan) {
            animation: scan 2s ease-in-out infinite;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
