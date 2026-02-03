"use server";

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";

export async function updateExchangeRate(rate: number) {
  const session = await auth();

  if (!session?.user || session.user.role !== "MERCHANT") {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  try {
    // إضافة سجل جديد في جدول أسعار الصرف المرتبط بهذا المستخدم
    await db.exchangeRate.create({
      data: {
        rate: rate,
        userId: session.user.id,
      },
    });

    // تحديث الكاش لكي تظهر القيمة الجديدة فوراً في الواجهة
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Exchange Rate Error:", error);
    return { error: "فشل تحديث سعر الصرف" };
  }
}