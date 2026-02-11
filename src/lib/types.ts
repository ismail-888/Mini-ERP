import type { 
  Product as PrismaProduct, 
  Category as PrismaCategory, 
  Brand as PrismaBrand 
} from "@prisma/client"

// 1. تعريف نوع المنتج مع العلاقات (Extended Product)
export type ProductWithRelations = PrismaProduct & {
  category?: PrismaCategory | null;
  brand?: PrismaBrand | null;
}

// 2. تحديث النوع الأساسي ليستخدم العلاقات افتراضياً (اختياري ولكن يسهل العمل)
export type Product = ProductWithRelations

// 3. الأنواع الخاصة بالواجهة
export interface CartItem extends ProductWithRelations {
  quantity: number
  lineTotalUSD: number
}

export interface PaymentBreakdown {
  cashUSD: number
  cashLBP: number
  cardUSD: number
}

// 4. استجابة الأكشنز
export type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
}