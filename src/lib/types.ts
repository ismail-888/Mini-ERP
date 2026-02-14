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

// 2. نوع Product للاستخدام العام (يدعم Prisma والبيانات التجريبية)
// export type Product=ProductWithRelations; --- IGNORE ---
export interface Product {
  id: string
  name: string
  barcode?: string | null
  image?: string | null
  
  // الأسعار - استخدام أسماء Prisma
  salePriceUSD: number
  costPriceUSD: number
  
  // الخصم
  discountValue?: number | null
  discountType?: string | null
  discountStartDate?: Date | null
  discountEndDate?: Date | null
  
  // المخزون - استخدام أسماء Prisma
  currentStock: number
  minStockAlert: number
  expiryDate?: Date | null
  
  // العلاقات - مرنة (يمكن أن تكون كائن أو نص)
  categoryId?: string | null
  category?: PrismaCategory  | null
  brandId?: string | null
  brand?: PrismaBrand | null
  
  // للبيانات التجريبية فقط
  subcategory?: string
  
  // معلومات إضافية
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

// 3. الأنواع الخاصة بالواجهة
// export interface CartItem extands ProductWithRelations  --- IGNORE ---
export interface CartItem extends Product {
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

// 5. نوع المتجر/المحل
export interface Shop {
  id: string
  name: string
  owner: string
  email: string
  subscriptionExpiry: string
  status: string
  productsCount: number
  salesThisMonth: number
}