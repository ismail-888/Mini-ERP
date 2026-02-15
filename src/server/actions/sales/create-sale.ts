"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "~/lib/types";
import { SaleStatus, PaymentType } from "@prisma/client"; // استيراد الـ Enums الجديدة

interface CreateSaleInput {
  items: {
    productId: string;
    quantity: number;
    priceUSD: number; 
    originalPrice: number; // السعر الأصلي قبل الخصم
    discountApplied: number; 
  }[];
  totalUSD: number;
  totalLBP: number;
  exchangeRate: number;
  paidCashUSD: number;
  paidCashLBP: number;
  paidCardUSD: number;
  paymentMethod: string; // سنحولها لـ PaymentType enum
}

export async function createSaleAction(data: CreateSaleInput): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const result = await db.$transaction(async (tx) => {
      
      // 1. حساب رقم الفاتورة التسلسلي (Invoice Number) الخاص بهذا المستخدم
      const lastSale = await tx.sale.findFirst({
        where: { userId: session.user.id },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true }
      });

      const nextInvoiceNumber = (lastSale?.invoiceNumber || 0) + 1;

      // 2. التحقق من المخزون
      for (const item of data.items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, userId: session.user.id },
          select: { currentStock: true, name: true }
        });

        if (!product || product.currentStock < item.quantity) {
          throw new Error(`مخزون غير كافٍ لمنتج: ${product?.name || 'غير معروف'}`);
        }
      }

      // 3. تحويل طريقة الدفع للـ Enum المناسب
      let paymentType: PaymentType = PaymentType.CASH;
      if (data.paymentMethod === "card") paymentType = PaymentType.CARD;
      if (data.paymentMethod === "split") paymentType = PaymentType.SPLIT;

      // 4. إنشاء الفاتورة مع العناصر
      const sale = await tx.sale.create({
        data: {
          userId: session.user.id,
          invoiceNumber: nextInvoiceNumber, // الرقم التسلسلي الجديد
          status: SaleStatus.PAID,
          paymentType: paymentType,
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
              originalPrice: item.originalPrice,
              priceUSD: item.priceUSD,
              discountApplied: item.discountApplied,
            })),
          },
        },
      });

      // 5. تحديث المخزون
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });
      }

      return sale;
    });

    revalidatePath("/dashboard/pos");
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