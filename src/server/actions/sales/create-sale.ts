"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "~/lib/types";

interface CreateSaleInput {
  items: {
    productId: string;
    quantity: number;
    priceUSD: number; // السعر الفعلي بعد الخصم
    discountApplied: number; // قيمة الخصم التي طبقت على القطعة الواحدة
  }[];
  totalUSD: number;
  totalLBP: number;
  exchangeRate: number;
  paidCashUSD: number;
  paidCashLBP: number;
  paidCardUSD: number;
}

export async function createSaleAction(data: CreateSaleInput): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const result = await db.$transaction(async (tx) => {
      
      // 1. التحقق من المخزون
      for (const item of data.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, userId: session.user.id },
          select: { currentStock: true, name: true }
        });

        if (!product || product.currentStock < item.quantity) {
          throw new Error(`مخزون غير كافٍ: ${product?.name || 'منتج غير معروف'}`);
        }
      }

      // 2. إنشاء الفاتورة (Sale) مع العناصر (SaleItem)
      const sale = await tx.sale.create({
        data: {
          userId: session.user.id,
          totalUSD: data.totalUSD,
          totalLBP: data.totalLBP,
          exchangeRate: data.exchangeRate,
          paidCashUSD: data.paidCashUSD,
          paidCashLBP: data.paidCashLBP,
          paidCardUSD: data.paidCardUSD,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceUSD: item.priceUSD,
              discountApplied: item.discountApplied,
            })),
          },
        },
      });

      // 3. تحديث المخزون (خصم الكميات)
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    // تحديث الكاش للواجهة
    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/sales");

    return { success: true, data: result };

  } catch (error: any) {
    console.error("SALE_ERROR:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "فشل في إتمام عملية البيع" 
    };
  }
}