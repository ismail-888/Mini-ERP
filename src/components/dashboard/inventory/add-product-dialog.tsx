"use client";

import React, { useState, useCallback, useRef } from "react";

import { X, ImageIcon, ScanBarcode, CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
// removed ScrollArea to rely on native scrolling within dialog content
import { categories, brands } from "~/lib/mock-data";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { createProductAction } from "~/server/actions/product";
import { useExchangeRate } from "~/contexts/exchange-rate-context";
import { toast } from "sonner";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductSchema,
  type ProductFormValues,
} from "~/lib/validations/product";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddProductDialog({ open, onClose }: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  // expiryDate is now managed inside the react-hook-form state (see schema)
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { convertToLBP, formatLBP } = useExchangeRate();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      barcode: "",
      brand: "",
      category: "",
      costPriceUSD: 0,
      salePriceUSD: 0,
      currentStock: 0,
      minStockAlert: 5,
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
  } = form;

  const resetForm = () => {
    reset();
    setImagePreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generateRandomBarcode = () => {
    const random = Math.floor(Math.random() * 900000000000) + 100000000000;
    setValue("barcode", random.toString(), { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    try {
      setLoading(true);

      // نستخدم spread operator لنقل كل القيم من values (الاسم، السعر، المخزون، وتاريخ الانتهاء)
      // ونضيف عليها الصورة من الـ state المحلي (imagePreview)
      const result = await createProductAction({
        ...values,
        image: imagePreview ?? undefined,
      });

      if (result.success) {
        toast.success("تم إضافة المنتج بنجاح");
        handleClose(); // هذه الدالة تقوم بعمل reset للفورم وإغلاق الـ Dialog
      } else {
        // في حال وجود خطأ من السيرفر (مثل باركود مكرر)
        toast.error(result.error);
      }
    } catch (error) {
      // خطأ غير متوقع في الاتصال أو السيرفر
      toast.error("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Calculate profit margin
  const cost = watch("costPriceUSD") ?? 0;
  const price = watch("salePriceUSD") ?? 0;
  const profitMargin = cost > 0 ? ((price - cost) / cost) * 100 : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[calc(100vh-2rem)] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 relative">
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in all the product details. Fields marked with * are required.
          </DialogDescription>

          {/* Close button inside header so it's always visible */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-6 pb-4">
          <Form {...form}>
            <form id="add-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label>Product Image</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground",
                    imagePreview && "border-solid",
                  )}
                >
                {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview ?? "/placeholder.svg"}
                        alt="Product preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                      onClick={clearImage}
                        className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-muted mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                        <ImageIcon className="text-muted-foreground h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">Drag & drop image here</p>
                      <p className="text-muted-foreground mt-1 text-xs">or click to browse</p>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 cursor-pointer opacity-0" />
                    </>
                  )}
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-foreground text-sm font-semibold">Basic Info</h3>
                <Separator />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input id="name" placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode (Optional)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input id="barcode" placeholder="Scan or leave empty to auto-generate" className="flex-1" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={generateRandomBarcode} title="Generate Barcode">
                          <ScanBarcode className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <FormControl>
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="text-foreground text-sm font-semibold">Pricing</h3>
                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={control}
                    name="costPriceUSD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price (USD) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">$</span>
                          <Input id="costUSD" type="number" step="0.01" min="0" placeholder="0.00" className="pl-7" {...field} onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))} />
                        </div>
                      </FormControl>
                      <div className="mt-1 min-h-[48px] flex items-center">
                        <FormMessage />
                      </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="salePriceUSD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (USD) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">$</span>
                            <Input id="priceUSD" type="number" step="0.01" min="0" placeholder="0.00" className="pl-7" {...field} onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))} />
                          </div>
                        </FormControl>
                        <div className="mt-1 min-h-[48px] flex flex-col justify-center">
                          {price > 0 && <p className="text-xs font-bold text-green-600">≈ {formatLBP(convertToLBP(price))}</p>}
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Profit row: span both columns so it aligns with inputs */}
                  {cost > 0 && price > 0 && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-sm">
                          Profit Margin:{" "}
                          <span className={cn("font-semibold", profitMargin > 0 ? "text-primary" : "text-destructive")}>
                            {profitMargin.toFixed(1)}%
                          </span>{" "}
                          (${(price - cost).toFixed(2)} per unit)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Control Section */}
              <div className="space-y-4">
                <h3 className="text-foreground text-sm font-semibold">Stock Control</h3>
                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stock</FormLabel>
                        <FormControl>
                          <Input id="stock" type="number" min="0" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="minStockAlert"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min-Stock Alert</FormLabel>
                        <FormControl>
                          <Input id="minStockAlert" type="number" min="0" placeholder="5" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start bg-transparent text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Select expiry date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={(date) => field.onChange(date ?? null)}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 px-6 pb-6 sm:gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-product-form"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
