"use client"

import React from "react"
import { useState, useCallback } from "react"
import { X, ImageIcon, ScanBarcode, CalendarIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Calendar } from "~/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { Separator } from "~/components/ui/separator"
import type { Product } from "~/lib/types"
import { categories, brands } from "~/lib/mock-data"
import { cn } from "~/lib/utils"
import { format } from "date-fns"

interface AddProductDrawerProps {
  open: boolean
  onClose: () => void
  onAdd: (product: Omit<Product, "id">) => void
}

export function AddProductDrawer({
  open,
  onClose,
  onAdd,
}: AddProductDrawerProps) {
  // Basic Info
  const [name, setName] = useState("")
  const [barcode, setBarcode] = useState("")
  const [brand, setBrand] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")

  // Pricing
  const [costUSD, setCostUSD] = useState("")
  const [priceUSD, setPriceUSD] = useState("")
  const [discountType, setDiscountType] = useState<"none" | "fixed" | "percentage">("none")
  const [discountValue, setDiscountValue] = useState("")

  // Stock Control
  const [stock, setStock] = useState("")
  const [minStockAlert, setMinStockAlert] = useState("5")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)

  // Image
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const selectedCategory = categories.find((c) => c.name === category)

  const resetForm = () => {
    setName("")
    setBarcode("")
    setBrand("")
    setCategory("")
    setSubcategory("")
    setCostUSD("")
    setPriceUSD("")
    setDiscountType("none")
    setDiscountValue("")
    setStock("")
    setMinStockAlert("5")
    setExpiryDate(undefined)
    setImagePreview(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !barcode || !priceUSD || !costUSD || !category) return

    const product: Omit<Product, "id"> = {
      name,
      barcode,
      brand: brand || undefined,
      category,
      subcategory: subcategory || undefined,
      costUSD: Number.parseFloat(costUSD),
      priceUSD: Number.parseFloat(priceUSD),
      discountType: discountType !== "none" ? discountType : undefined,
      discountValue: discountType !== "none" ? Number.parseFloat(discountValue) : undefined,
      stock: Number.parseInt(stock) || 0,
      minStockAlert: Number.parseInt(minStockAlert) || 5,
      expiryDate: expiryDate ? format(expiryDate, "yyyy-MM-dd") : undefined,
      image: imagePreview || undefined,
    }

    onAdd(product)
    resetForm()
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Calculate profit margin
  const cost = Number.parseFloat(costUSD) || 0
  const price = Number.parseFloat(priceUSD) || 0
  const profitMargin = cost > 0 ? ((price - cost) / cost) * 100 : 0

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add New Product</SheetTitle>
          <SheetDescription>
            Fill in all the product details. Fields marked with * are required.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label>Product Image</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground",
                imagePreview && "border-solid"
              )}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Product preview"
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Drag & drop image here</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </>
              )}
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Basic Info</h3>
            <Separator />

            <div className="space-y-2">
              <label htmlFor="name">Product Name *</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="barcode">Barcode *</label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter or scan barcode"
                  className="flex-1"
                  required
                />
                <Button type="button" variant="outline" size="icon">
                  <ScanBarcode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="brand">Brand</label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="category">Category *</label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    setCategory(val)
                    setSubcategory("")
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="subcategory">Sub-category</label>
                <Select
                  value={subcategory}
                  onValueChange={setSubcategory}
                  disabled={!category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pricing</h3>
            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="costUSD">Cost Price (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="costUSD"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costUSD}
                    onChange={(e) => setCostUSD(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="priceUSD">Sale Price (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="priceUSD"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(e.target.value)}
                    placeholder="0.00"
                    className="pl-7"
                    required
                  />
                </div>
              </div>
            </div>

            {cost > 0 && price > 0 && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">
                  Profit Margin:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      profitMargin > 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {profitMargin.toFixed(1)}%
                  </span>{" "}
                  (${(price - cost).toFixed(2)} per unit)
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="discountType">Discount Type</label>
                <Select
                  value={discountType}
                  onValueChange={(val) =>
                    setDiscountType(val as "none" | "fixed" | "percentage")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No discount</SelectItem>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discountType !== "none" && (
                <div className="space-y-2">
                  <label htmlFor="discountValue">
                    Discount {discountType === "fixed" ? "($)" : "(%)"}
                  </label>
                  <Input
                    id="discountValue"
                    type="number"
                    step={discountType === "percentage" ? "1" : "0.01"}
                    min="0"
                    max={discountType === "percentage" ? "100" : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stock Control Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Stock Control
            </h3>
            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="stock">Initial Stock</label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="minStockAlert">Min-Stock Alert</label>
                <Input
                  id="minStockAlert"
                  type="number"
                  min="0"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label>Expiry Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <SheetFooter className="gap-2 pt-4 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || !barcode || !priceUSD || !costUSD || !category}
            >
              Add Product
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
