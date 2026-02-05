import * as z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, { message: "اسم المنتج مطلوب" }),
  barcode: z.string().optional().or(z.literal("")),
  brand: z.string().optional().or(z.literal("")),
  category: z.string().min(1, { message: "الفئة مطلوبة" }),
  
  // Using coerce ensures that if a string is passed (like from an input), 
  // it tries to turn it into a number before validating.
  costPriceUSD: z.coerce
    .number({ invalid_type_error: "سعر الكلفة يجب أن يكون رقمًا" })
    .min(0, { message: "سعر الكلفة يجب أن يكون 0 أو أكثر" }),
    
  salePriceUSD: z.coerce
    .number({ invalid_type_error: "سعر البيع يجب أن يكون رقمًا" })
    .min(0, { message: "سعر البيع يجب أن يكون 0 أو أكثر" }),
    
  currentStock: z.coerce
    .number({ invalid_type_error: "المخزون يجب أن يكون رقمًا" })
    .min(0, { message: "المخزون يجب أن يكون 0 أو أكثر" }),
    
  minStockAlert: z.coerce
    .number({ invalid_type_error: "حد تنبيه المخزون يجب أن يكون رقمًا" })
    .min(0, { message: "حد تنبيه المخزون يجب أن يكون 0 أو أكثر" }),

  // ADD THESE:
  expiryDate: z.date().nullable().optional(),
  image: z.string().optional(), 
})
.refine((data) => data.salePriceUSD >= data.costPriceUSD, {
  message: "سعر البيع لا يمكن أن يكون أقل من سعر الكلفة",
  path: ["salePriceUSD"],
});

export type ProductFormValues = z.infer<typeof ProductSchema>;