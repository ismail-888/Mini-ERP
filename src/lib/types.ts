export interface Product {
  id: string
  name: string
  barcode: string
  brand?: string
  category: string
  subcategory?: string
  costUSD: number
  priceUSD: number
  discountType?: "fixed" | "percentage"
  discountValue?: number
  stock: number
  minStockAlert: number
  expiryDate?: string
  image?: string
}

export interface CartItem extends Product {
  quantity: number
  lineDiscount?: number
}

export interface Shop {
  id: string
  name: string
  owner: string
  email: string
  subscriptionExpiry: string
  status: "active" | "suspended"
  productsCount: number
  salesThisMonth: number
}

export interface ExchangeRate {
  usdToLBP: number
  lastUpdated: string
}

export interface PaymentBreakdown {
  cashUSD: number
  cashLBP: number
  card: number
}
