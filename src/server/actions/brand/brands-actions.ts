"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "~/lib/types";
import { Prisma } from "@prisma/client";

// --- 1. جلب كل الماركات (مع عدد المنتجات المرتبطة) ---
export async function getBrandsAction(): Promise<ActionResponse<any[]>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const brands = await db.brand.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { products: true } 
        }
      },
      orderBy: { name: "asc" }
    });
    return { success: true, data: brands };
  } catch (error) {
    return { success: false, error: "فشل في جلب العلامات التجارية" };
  }
}

// --- 2. جلب ماركة واحدة ---
export async function getBrandByIdAction(id: string): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const brand = await db.brand.findUnique({
      where: { id, userId: session.user.id }
    });
    if (!brand) return { success: false, error: "الماركة غير موجودة" };
    return { success: true, data: brand };
  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء جلب البيانات" };
  }
}

// --- 3. إنشاء ماركة جديدة ---
export async function createBrandAction(name: string): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const brand = await db.brand.create({
      data: {
        name: name.trim(),
        userId: session.user.id
      }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/brand");
    return { success: true, data: brand };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "هذه الماركة موجودة مسبقاً" };
    }
    return { success: false, error: "فشل في إضافة الماركة" };
  }
}

// --- 4. تحديث ماركة ---
export async function updateBrandAction(id: string, name: string): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const updated = await db.brand.update({
      where: { id, userId: session.user.id },
      data: { name: name.trim() }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/brand");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "فشل في تحديث الماركة" };
  }
}

// --- 5. حذف ماركة (مع الأمان: onDelete: SetNull سيعمل تلقائياً) ---
export async function deleteBrandAction(id: string): Promise<ActionResponse<null>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await db.brand.delete({
      where: { id, userId: session.user.id }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/brand");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "فشل في حذف الماركة" };
  }
}

// --- 6. حذف مجموعة ماركات (Bulk) ---
export async function bulkDeleteBrandsAction(ids: string[]): Promise<ActionResponse<null>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await db.brand.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id
      }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/brand");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "فشل في حذف الماركات المحددة" };
  }
}