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
    revalidatePath("/dashboard", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Exchange Rate Error:", error);
    return { error: "فشل تحديث سعر الصرف" };
  }
}

/**
 * يجلب أحدث سعر صرف للمستخدم الحالي
 * يتبع منطق الأولوية:
 * 1. سعر خاص بالمستخدم إذا وجد
 * 2. سعر الأدمن إذا لم يوجد سعر خاص
 * 3. القيمة الافتراضية 89000
 */
export async function getLatestExchangeRateAction(): Promise<number> {
  const session = await auth();
  
  // إذا لم يكن هناك مستخدم، نعيد القيمة الافتراضية
  if (!session?.user?.id) return 89000;

  try {
    // 1. محاولة جلب السعر الخاص بالمستخدم
    let latestRateEntry = await db.exchangeRate.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // 2. إذا لم يوجد، نحاول جلب سعر من أي مسؤول (Admin)
    if (!latestRateEntry) {
      latestRateEntry = await db.exchangeRate.findFirst({
        where: { 
          user: { 
            role: "ADMIN" 
          } 
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // القيمة النهائية أو الافتراضية
    return latestRateEntry?.rate ?? 89000;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 89000;
  }
}