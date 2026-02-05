"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

export async function createProductAction(data: {
  name: string;
  barcode?: string;
  category?: string;
  brand?: string;
  costPriceUSD: number;
  salePriceUSD: number;
  currentStock: number;
  minStockAlert: number;
  expiryDate?: Date | null;
  image?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const product = await db.product.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    revalidatePath("/inventory"); // تحديث البيانات في الصفحة فوراً
    return { success: true, data: product };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "الباركود هذا موجود مسبقاً في محلك" };
    }
    return { success: false, error: "حدث خطأ أثناء حفظ المنتج" };
  }
}