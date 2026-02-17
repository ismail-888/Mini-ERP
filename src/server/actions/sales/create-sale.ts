"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "~/lib/types";
import { SaleStatus, PaymentType } from "@prisma/client";

interface CreateSaleInput {
  items: {
    productId: string;
    name: string; // أضفنا حقل الاسم هنا لاستلامه من الـ Frontend
    quantity: number;
    priceUSD: number; 
    originalPrice: number;
    discountApplied: number; 
  }[];
  totalUSD: number;
  totalLBP: number;
  exchangeRate: number;
  paidCashUSD: number;
  paidCashLBP: number;
  paidCardUSD: number;
  paymentMethod: string;
}

export async function createSaleAction(data: CreateSaleInput): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const result = await db.$transaction(async (tx) => {
      
      const realItems = data.items.filter(item => !item.productId.startsWith("manual-"));
      const realProductIds = realItems.map(i => i.productId);
      let lowStockAlerts: string[] = [];

      // 1. التحقق من المخزون للمنتجات الحقيقية
      if (realProductIds.length > 0) {
        const products = await tx.product.findMany({
          where: { 
            id: { in: realProductIds }, 
            userId: session.user.id 
          },
          select: { id: true, currentStock: true, name: true, minStockAlert: true }
        });

        for (const item of realItems) {
          const product = products.find(p => p.id === item.productId);
          if (!product) throw new Error(`المنتج ${item.name} غير موجود`);
          if (product.currentStock < item.quantity) {
            throw new Error(`مخزون غير كافٍ لمنتج: ${product.name}`);
          }
        }
      }

      // 2. حساب رقم الفاتورة
      const lastSale = await tx.sale.findFirst({
        where: { userId: session.user.id },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true }
      });
      const nextInvoiceNumber = (lastSale?.invoiceNumber || 0) + 1;

      const paymentType = {
        card: PaymentType.CARD,
        split: PaymentType.SPLIT,
        cash: PaymentType.CASH,
      }[data.paymentMethod] || PaymentType.CASH;

      // 3. إنشاء الفاتورة مع itemName
      const sale = await tx.sale.create({
        data: {
          userId: session.user.id,
          invoiceNumber: nextInvoiceNumber,
          status: SaleStatus.PAID,
          paymentType,
          totalUSD: data.totalUSD,
          totalLBP: data.totalLBP,
          exchangeRate: data.exchangeRate,
          paidCashUSD: data.paidCashUSD,
          paidCashLBP: data.paidCashLBP,
          paidCardUSD: data.paidCardUSD,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId.startsWith("manual-") ? null : item.productId,
              itemName: item.name, // سيتم حفظ اسم المنتج هنا سواء كان يدوياً أو حقيقياً
              quantity: item.quantity,
              originalPrice: item.originalPrice,
              priceUSD: item.priceUSD,
              discountApplied: item.discountApplied,
            })),
          },
        },
        include: { items: true }
      });

      // 4. تحديث المخزون بشكل مجمّع (Batch update)
      if (realItems.length > 0) {
        await Promise.all(
          realItems.map(item =>
            tx.product.update({
              where: { id: item.productId },
              data: { currentStock: { decrement: item.quantity } },
            })
          )
        );

        // 5. جلب المنتجات المحدثة للتحقق من التنبيهات
        const updatedProducts = await tx.product.findMany({
          where: { id: { in: realProductIds } },
          select: { name: true, currentStock: true, minStockAlert: true }
        });

        lowStockAlerts = updatedProducts
          .filter(p => p.currentStock <= p.minStockAlert)
          .map(p => `${p.name} (بقي ${p.currentStock} قطع)`);
      }

      return { ...sale, lowStockAlerts };
    }, {
      maxWait: 10000,
      timeout: 15000 
    });

    // Revalidate paths asynchronously (non-blocking)
    Promise.all([
      revalidatePath("/dashboard/pos"),
      revalidatePath("/dashboard/inventory"),
    ]).catch(console.error);

    return { success: true, data: result };

  } catch (error: any) {
    console.error("SALE_ERROR:", error);
    return { 
      success: false, 
      error: error.message || "فشل في إتمام عملية البيع" 
    };
  }
}