import * as z from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  barcode: z.string().optional().nullable().or(z.literal("")),
  brand: z.string().optional().nullable().or(z.literal("")),
  category: z.string().min(1, { message: "Category is required" }),
  
  costPriceUSD: z.coerce.number().min(0, { message: "Cost price must be 0 or greater" }),
  salePriceUSD: z.coerce.number().min(0, { message: "Sale price must be 0 or greater" }),
  currentStock: z.coerce.number().min(0, { message: "Initial stock must be 0 or greater" }),
  minStockAlert: z.coerce.number().min(0, { message: "Min-stock alert must be 0 or greater" }),

  expiryDate: z.date().nullable().optional(),
  image: z.string().optional(),

  // --- Discount fields ---
  discountValue: z.coerce.number().min(0, { message: "Discount value must be 0 or greater" }).default(0),
  discountType: z.enum(["fixed", "percentage"]).default("fixed"),
  
  discountStartDate: z.date().nullable().optional(),
  discountEndDate: z.date().nullable().optional(),
})
// 1. Ensure sale price is not less than cost price
.refine((data) => data.salePriceUSD >= data.costPriceUSD, {
  message: "Sale price cannot be less than cost price",
  path: ["salePriceUSD"],
})
// 2. If discount is percentage, ensure it does not exceed 100%
.refine((data) => {
  if (data.discountType === "percentage") {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
})
// 3. Ensure discount end date is after its start date
.refine((data) => {
  if (data.discountStartDate && data.discountEndDate) {
    return data.discountEndDate >= data.discountStartDate;
  }
  return true;
}, {
  message: "Discount end date must be after its start date",
  path: ["discountEndDate"],
});

export type ProductFormValues = z.infer<typeof ProductSchema>;