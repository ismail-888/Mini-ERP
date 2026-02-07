import type { Product as PrismaProduct } from "@prisma/client"

// 1. Re-export the Prisma Product so you can just import { Product } from "~/lib/types"
export type Product = PrismaProduct

// 2. Define types that ONLY exist in the UI/Frontend
export interface CartItem extends PrismaProduct {
  quantity: number
  lineTotalUSD: number
}

export interface PaymentBreakdown {
  cashUSD: number
  cashLBP: number
  cardUSD: number
}

// 3. Define types for your Server Action responses
export type ActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
}