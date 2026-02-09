"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

import { X, ImageIcon, ScanBarcode, CalendarIcon, Loader2, Camera } from "lucide-react";
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
import { Html5QrcodeScanner } from "html5-qrcode";

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
import { type Product } from "~/lib/types";
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
  onAdd?: (product: Product) => void;
}


export function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  // expiryDate is now managed inside the react-hook-form state (see schema)
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const { convertToLBP, formatLBP } = useExchangeRate();

  const form = useForm({
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
      // الحقول الجديدة
      discountValue: 0,
      discountType: "fixed",
      discountStartDate: null,
      discountEndDate: null,
      expiryDate: null,
    },
  });

  const { handleSubmit, control, watch, reset, setValue, setFocus } = form;

  const resetForm = () => {
    reset();
    setImagePreview(null);
  };

  const startScanning = () => {
    // toggle UI; actual scanner initialization happens in the effect that waits
    // for the reader element to mount to the DOM.
    setIsScanning(true);
  };

  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      // wait for the reader element to be present (max ~1s)
      const start = Date.now();
      while (mounted && !document.getElementById("reader") && Date.now() - start < 1000) {
        // small delay to avoid spamming the console
        await new Promise((r) => setTimeout(r, 100));
      }

      if (!mounted) return;

      const el = document.getElementById("reader");
      if (!el) {
        console.error("Scanner start error: HTML Element with id=reader not found");
        toast.error("Unable to start camera (no reader element).");
        setIsScanning(false);
        return;
      }

      try {
        const scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          false,
        );

        scannerRef.current = scanner;

        scanner.render(
          (decodedText: string) => {
            setValue("barcode", decodedText, { shouldValidate: true });
            toast.success("Scanned: " + decodedText);
            void (async () => {
              try {
                await scanner.clear();
              } catch {
                // ignore
              }
              scannerRef.current = null;
              setIsScanning(false);
            })();
          },
          () => {
            // ignore frame errors
          },
        );
      } catch (err) {
        // initialization errors
        console.error("Scanner start error:", err);
        toast.error("Unable to start camera. Check permissions.");
        setIsScanning(false);
      }
    };

    if (isScanning) {
      void initScanner();
    }

    return () => {
      mounted = false;
    };
    // only depends on isScanning
  }, [isScanning, setValue]);

  const stopScanning = async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      // Html5QrcodeScanner exposes clear() which returns a promise
      await scanner.clear();
    } catch (err) {
      // best-effort cleanup
      console.warn("Error clearing scanner", err);
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  };
 
  useEffect(() => {
    // when dialog closes, ensure scanner is stopped
    if (!open) {
      void stopScanning();
    }
    // cleanup on unmount
    return () => {
      void stopScanning();
    };
 
  }, [open]);

  const handleClose = () => {
    // ensure scanner is stopped when dialog closes
    void stopScanning();
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

      const result = await createProductAction({
        ...values,
        // معالجة الحقول التي قد تكون نصاً فارغاً لتخزينها كـ undefined/null في قاعدة البيانات
        barcode: values.barcode ?? undefined,
        brand: values.brand ?? undefined,
        // إضافة الصورة من الـ state المحلي
        image: imagePreview ?? undefined,
      });

      if (result.success) {
        toast.success("تم إضافة المنتج بنجاح");
        // notify parent so it can prepend the new product to the table
        try {
          if (result.data && onAdd) onAdd(result.data);
        } catch (err) {
          // ignore parent handler errors
          console.warn("onAdd handler threw:", err);
        }
        handleClose();
      } else {
        toast.error(result.error);
        // If barcode duplicate, focus the barcode input for quick fix
        if (typeof result.error === "string" && result.error.includes("باركود")) {
          try {
            setFocus("barcode");
          } catch {
            // ignore if setFocus not available
          }
        }
      }
    } catch (error) {
      console.error("Submit Error:", error);
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

  // Calculate pricing values
  const cost = watch("costPriceUSD") ?? 0;
  const price = watch("salePriceUSD") ?? 0;
  const discountType = watch("discountType");
  const discountValue = Number(watch("discountValue") ?? 0) || 0;

  let finalPrice =
    discountType === "percentage"
      ? price - price * (discountValue / 100)
      : price - discountValue;

  finalPrice = Math.max(0, Number.isNaN(finalPrice) ? price : finalPrice);

  // Profit margin should be calculated from the effective final price (after discount)
  const profitMargin = cost > 0 ? ((finalPrice - cost) / cost) * 100 : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="flex max-h-[calc(100vh-2rem)] w-[95vw] flex-col p-0 sm:max-w-2xl md:max-w-4xl">
        <DialogHeader className="relative px-6 pt-6">
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
            <form
              id="add-product-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
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
                      <p className="text-sm font-medium">
                        Drag & drop image here
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        or click to browse
                      </p>
                      <input
                        ref={fileInputRef}
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
                <h3 className="text-foreground text-sm font-semibold">
                  Basic Info
                </h3>
                <Separator />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Enter product name"
                          {...field}
                        />
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
                          <Input
                            id="barcode"
                            placeholder="Scan or leave empty to auto-generate"
                            className="flex-1"
                            {...field}
                            value={field.value ?? ""}
                          onKeyDown={(e) => {
                            // prevent Enter from submitting when using physical barcode scanners
                            if (e.key === "Enter") {
                              e.preventDefault();
                            }
                          }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={generateRandomBarcode}
                          title="Generate Barcode"
                        >
                          <ScanBarcode className="h-4 w-4" />
                        </Button>
                      <Button
                        type="button"
                        variant={isScanning ? "destructive" : "outline"}
                        size="icon"
                        onClick={() => {
                          if (isScanning) void stopScanning();
                          else startScanning();
                        }}
                        title="Use Camera"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      </div>
                    </FormItem>
                  )}
                />

              {/* Camera reader — appears only when scanning */}
              {isScanning && (
                <div className="mt-3">
                  <div
                    id="reader"
                    className="mx-auto w-full max-w-md overflow-hidden rounded-lg border bg-black/5"
                    style={{ aspectRatio: "4/3" }}
                  />
                  <div className="mt-2 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={stopScanning}
                    >
                      Stop Scanner
                    </Button>
                  </div>
                </div>
              )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
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
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
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
                <h3 className="text-foreground text-sm font-semibold">
                  Pricing
                </h3>
                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="costPriceUSD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price (USD) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                              $
                            </span>
                            <Input
                              id="costUSD"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <div className="mt-1 flex min-h-[48px] items-center">
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
                            <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                              $
                            </span>
                            <Input
                              id="priceUSD"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <div className="mt-1 flex min-h-[48px] flex-col justify-center">
                          {price > 0 && (
                            <p className="text-xs font-bold text-green-600">
                              ≈ {formatLBP(convertToLBP(price))}
                            </p>
                          )}
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Profit & Final Price Preview */}
                  {cost > 0 && price > 0 && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className="bg-muted/50 border-border grid grid-cols-2 gap-4 rounded-lg border p-3">
                        <div>
                          <p className="text-muted-foreground text-xs tracking-wider uppercase">
                            Profit Margin
                          </p>
                          <p
                            className={cn(
                              "text-lg font-bold",
                              profitMargin > 0
                                ? "text-green-600"
                                : "text-destructive",
                            )}
                          >
                            {profitMargin.toFixed(1)}%
                            <span className="text-muted-foreground ml-1 text-xs font-normal">
                              (${(finalPrice - cost).toFixed(2)})
                            </span>
                          </p>
                        </div>

                        {discountValue > 0 && (
                          <div className="border-l pl-4 text-right">
                            <p className="text-muted-foreground text-xs tracking-wider uppercase">
                              Final Price
                            </p>
                            <p className="text-primary text-lg font-bold">
                              ${finalPrice.toFixed(2)}
                            </p>
                            <p className="text-[10px] font-bold text-green-600">
                              ≈ {formatLBP(convertToLBP(finalPrice))}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Discount fields - added per new schema */}
                  <FormField
                    control={control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value ?? "fixed"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">
                                Fixed Amount
                              </SelectItem>
                              <SelectItem value="percentage">
                                Percentage
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="discountValue"
                              type="number"
                              step="0.01"
                              min="0"
                              max={
                                watch("discountType") === "percentage"
                                  ? 100
                                  : undefined
                              }
                              placeholder={
                                watch("discountType") === "percentage"
                                  ? "0 - 100"
                                  : "0.00"
                              }
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              className={cn(
                                watch("discountType") === "percentage"
                                  ? "pr-10"
                                  : "",
                              )}
                            />
                            {watch("discountType") === "percentage" && (
                              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                                %
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="discountStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date (optional)</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start bg-transparent text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Select start date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={(date) =>
                                  field.onChange(date ?? null)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="discountEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (optional)</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start bg-transparent text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Select end date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={(date) =>
                                  field.onChange(date ?? null)
                                }
                                initialFocus
                                disabled={(date) => {
                                  const start = watch("discountStartDate");
                                  if (start) {
                                    return date < new Date(start);
                                  }
                                  return false;
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Stock Control Section */}
              <div className="space-y-4">
                <h3 className="text-foreground text-sm font-semibold">
                  Stock Control
                </h3>
                <Separator />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stock</FormLabel>
                        <FormControl>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
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
                          <Input
                            id="minStockAlert"
                            type="number"
                            min="0"
                            placeholder="5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
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
                              className={cn(
                                "w-full justify-start bg-transparent text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "PPP")
                                : "Select expiry date"}
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
          <Button type="submit" form="add-product-form" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
