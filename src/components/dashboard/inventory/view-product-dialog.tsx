"use client"

import React, { useEffect, useState } from "react";
import { getProductByIdAction } from "~/server/actions/get-products";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { type Product } from "~/lib/types";

interface ViewProductDialogProps {
  open: boolean;
  productId?: string | null;
  onClose: () => void;
}

export default function ViewProductDialog({ open, productId, onClose }: ViewProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!open || !productId) {
      setProduct(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await getProductByIdAction(productId);
        if (!mounted) return;
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          setError(res.error || "Failed to load product");
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex flex-col max-h-[90vh] w-[95vw] sm:max-w-2xl p-0">
        <DialogHeader showCloseButton={true} className="relative px-3 pt-3 sm:px-6 sm:pt-6">
          <DialogTitle className="text-base sm:text-lg">View Product</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">Product details and history</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto px-3 pb-3 sm:px-6 sm:pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-3 sm:p-4 text-destructive text-sm">{error}</div>
          ) : product ? (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <div className="col-span-1 flex items-start justify-center">
                <div className="w-32 sm:w-40">
                  <img src={product.image ?? '/placeholder.svg'} alt={product.name} className="rounded-lg object-cover w-full h-32 sm:h-40 border" />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-semibold break-words">{product.name}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{product.category ?? 'General'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <p className="text-sm font-medium">{product.brand ?? '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Barcode</p>
                    <p className="text-sm font-medium font-mono">{product.barcode ?? '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Cost Price (USD)</p>
                    <p className="text-sm font-medium">${(product.costPriceUSD ?? 0).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Sale Price (USD)</p>
                    <p className="text-sm font-medium">${(product.salePriceUSD ?? 0).toFixed(2)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Current Stock</p>
                    <p className="text-sm font-medium">{product.currentStock}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Min Stock Alert</p>
                    <p className="text-sm font-medium">{product.minStockAlert}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Discount</p>
                    <p className="text-sm font-medium">{product.discountValue ? `${product.discountValue} ${product.discountType === 'percentage' ? '%' : 'USD'}` : '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{product.createdAt ? format(new Date(product.createdAt), 'PPP p') : '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium">{product.updatedAt ? format(new Date(product.updatedAt), 'PPP p') : '—'}</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4 text-muted-foreground text-sm">No product selected</div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background border-t px-3 py-3 sm:px-6 sm:py-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="text-sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
