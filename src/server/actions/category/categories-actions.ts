"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse } from "~/lib/types";
import { Prisma } from "@prisma/client";

// --- 1. جلب كل التصنيفات للمستخدم الحالي ---
export async function getCategoriesAction(): Promise<ActionResponse<any[]>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const categories = await db.category.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { products: true } // ميزة رائعة لمعرفة كم منتج مرتبط بهذا التصنيف
        }
      },
      orderBy: { name: "asc" }
    });
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: "فشل في جلب التصنيفات" };
  }
}

// --- 2. جلب تصنيف واحد بالمعرف ---
export async function getCategoryByIdAction(id: string): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const category = await db.category.findUnique({
      where: { id, userId: session.user.id }
    });
    if (!category) return { success: false, error: "التصنيف غير موجود" };
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: "حدث خطأ أثناء جلب البيانات" };
  }
}

// --- 3. إنشاء تصنيف جديد ---
export async function createCategoryAction(name: string): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const category = await db.category.create({
      data: {
        name: name.trim(),
        userId: session.user.id
      }
    });
    revalidatePath("/dashboard/inventory"); // لتحديث القوائم المنسدلة
    revalidatePath("/dashboard/category"); // لتحديث جدول التصنيفات
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "هذا التصنيف موجود مسبقاً في حسابك" };
    }
    return { success: false, error: "فشل في إنشاء التصنيف" };
  }
}

// --- 4. تحديث تصنيف موجود ---
export async function updateCategoryAction(id: string, name: string): Promise<ActionResponse<any>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const updated = await db.category.update({
      where: { id, userId: session.user.id },
      data: { name: name.trim() }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/category");
    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: "فشل في تحديث التصنيف" };
  }
}

// --- 5. حذف تصنيف واحد ---
export async function deleteCategoryAction(id: string): Promise<ActionResponse<null>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await db.category.delete({
      where: { id, userId: session.user.id }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/category");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "فشل في حذف التصنيف. تأكد من عدم ارتباطه بمنتجات." };
  }
}

// --- 6. حذف مجموعة تصنيفات (Bulk) ---
export async function bulkDeleteCategoriesAction(ids: string[]): Promise<ActionResponse<null>> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    await db.category.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id
      }
    });
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/category");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "فشل في حذف بعض التصنيفات" };
  }
}