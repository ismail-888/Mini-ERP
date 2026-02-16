"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "~/lib/types";
import { SaleStatus, PaymentType } from "@prisma/client";

interface CreateSaleInput {
  items: {
    productId: string;
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
    // زيادة الـ Timeout لـ 10 ثواني بدلاً من الـ default الصغير
    const result = await db.$transaction(async (tx) => {
      
      // 1. جلب كل المنتجات المطلوبة مرة واحدة بدلاً من Loop (أسرع بكثير)
      const productIds = data.items.map(i => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, userId: session.user.id },
        select: { id: true, currentStock: true, name: true }
      });

      // 2. التحقق من المخزون في الذاكرة
      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.currentStock < item.quantity) {
          throw new Error(`مخزون غير كافٍ لمنتج: ${product?.name || 'غير معروف'}`);
        }
      }

      // 3. حساب رقم الفاتورة
      const lastSale = await tx.sale.findFirst({
        where: { userId: session.user.id },
        orderBy: { invoiceNumber: 'desc' },
        select: { invoiceNumber: true }
      });
      const nextInvoiceNumber = (lastSale?.invoiceNumber || 0) + 1;

      // 4. تحويل طريقة الدفع
      const paymentType = {
        card: PaymentType.CARD,
        split: PaymentType.SPLIT,
        cash: PaymentType.CASH,
      }[data.paymentMethod] || PaymentType.CASH;

      // 5. إنشاء الفاتورة وتحديث المخزون (Prisma ستقوم بهما كـ Batch)
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
              productId: item.productId,
              quantity: item.quantity,
              originalPrice: item.originalPrice,
              priceUSD: item.priceUSD,
              discountApplied: item.discountApplied,
            })),
          },
        },
      });

      // 6. تحديث المخزون لكل منتج
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });
      }

      return sale;
    }, {
      maxWait: 5000, // وقت انتظار فتح العملية
      timeout: 10000 // وقت تنفيذ العملية بالكامل
    });

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/sales");

    return { success: true, data: result };

  } catch (error: any) {
    console.error("SALE_ERROR:", error.message);
    // تنظيف رسالة الخطأ للمستخدم
    let friendlyError = "فشل في إتمام عملية البيع";
    if (error.message.includes("مخزون غير كافٍ")) friendlyError = error.message;

    return { success: false, error: friendlyError };
  }
}