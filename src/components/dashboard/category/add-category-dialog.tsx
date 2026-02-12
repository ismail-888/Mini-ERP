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

// Server actions (optional) - adapt to existing server actions if available
import { createCategoryAction } from "~/server/actions/category/categories-actions"
import { updateCategoryAction } from "~/server/actions/category/categories-actions"

const CategorySchema = z.object({
  name: z.string().min(1, "اسم التصنيف مطلوب"),
})

type CategoryFormValues = z.infer<typeof CategorySchema>

interface Category {
  id: string
  name: string
}

interface AddCategoryDialogProps {
  open: boolean
  onClose: () => void
  onAdd?: (category: Category) => void
  onEdit?: (category: Category) => void
  category?: Category
  isLoading?: boolean
  mode?: "add" | "edit"
}

export function AddCategoryDialog({ open, onClose, onAdd, onEdit, category, isLoading = false, mode = "add" }: AddCategoryDialogProps) {
  const isEditMode = mode === "edit" || !!category
  const [loading, setLoading] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: category?.name ?? "",
    },
  })

  const { handleSubmit, reset, control } = form

  useEffect(() => {
    if (category) {
      reset({ name: category.name ?? "" })
    } else if (!isEditMode && open) {
      reset({ name: "" })
    }
  }, [category, isEditMode, open, reset])

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setLoading(true)

      if (isEditMode && category?.id) {
        const result = await updateCategoryAction(category.id, values.name)
        if (result?.success) {
          toast.success("تم تحديث التصنيف")
          onEdit?.(result.data)
          handleClose()
        } else {
          toast.error(result?.error ?? "خطأ أثناء التحديث")
        }
      } else {
        const result = await createCategoryAction(values.name)
        if (result?.success) {
          toast.success("تم إضافة التصنيف")
          onAdd?.(result.data)
          handleClose()
        } else {
          toast.error(result?.error ?? "خطأ أثناء الإنشاء")
        }
      }
    } catch (err) {
      console.error("Category submit error", err)
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
          <DialogTitle>{isEditMode ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update category name." : "Create a new category."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <Form {...form}>
            <form id="add-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
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
          <Button type="submit" form="add-category-form" disabled={loading || isLoading}>
            {(loading || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Saving..." : isEditMode ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddCategoryDialog
