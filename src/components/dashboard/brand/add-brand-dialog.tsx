"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createBrandAction } from "~/server/actions/brand/brands-actions"
import { updateBrandAction } from "~/server/actions/brand/brands-actions"

const BrandSchema = z.object({
  name: z.string().min(1, "اسم العلامة التجارية مطلوب"),
})

type BrandFormValues = z.infer<typeof BrandSchema>

interface Brand {
  id: string
  name: string
}

interface AddBrandDialogProps {
  open: boolean
  onClose: () => void
  onAdd?: (brand: Brand) => void
  onEdit?: (brand: Brand) => void
  brand?: Brand
  isLoading?: boolean
  mode?: "add" | "edit"
}

export function AddBrandDialog({ open, onClose, onAdd, onEdit, brand, isLoading = false, mode = "add" }: AddBrandDialogProps) {
  const isEditMode = mode === "edit" || !!brand
  const [loading, setLoading] = useState(false)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(BrandSchema),
    defaultValues: {
      name: brand?.name ?? "",
    },
  })

  const { handleSubmit, reset, control } = form

  useEffect(() => {
    if (brand) {
      reset({ name: brand.name ?? "" })
    } else if (!isEditMode && open) {
      reset({ name: "" })
    }
  }, [brand, isEditMode, open, reset])

  const onSubmit = async (values: BrandFormValues) => {
    try {
      setLoading(true)

      if (isEditMode && brand?.id) {
        const result = await updateBrandAction(brand.id, values.name)
        if (result?.success) {
          toast.success("تم تحديث العلامة التجارية")
          onEdit?.(result.data)
          handleClose()
        } else {
          toast.error(result?.error ?? "خطأ أثناء التحديث")
        }
      } else {
        const result = await createBrandAction(values.name)
        if (result?.success) {
          toast.success("تم إضافة العلامة التجارية")
          onAdd?.(result.data)
          handleClose()
        } else {
          toast.error(result?.error ?? "خطأ أثناء الإنشاء")
        }
      }
    } catch (err) {
      console.error("Brand submit error", err)
      toast.error("حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader showCloseButton className="px-6 pt-6">
          <DialogTitle>{isEditMode ? "Edit Brand" : "Add Brand"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update brand name." : "Create a new brand."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <Form {...form}>
            <form id="add-brand-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 px-6 pb-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading || isLoading}>
            Cancel
          </Button>
          <Button type="submit" form="add-brand-form" disabled={loading || isLoading}>
            {(loading || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : isEditMode ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddBrandDialog
