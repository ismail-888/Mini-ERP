"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { type ActionResponse, type Product } from "~/lib/types";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js"; 
import { env } from "~/env";

// تعريف السوبابيس هنا ضروري لتعمل دوال الحذف
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getInventoryAction(): Promise<ActionResponse<Product[]>> {
 const session = await auth();
  
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const products = await db.product.findMany({
      where: { userId: session.user.id },
      include: {
        category: true , 
        brand: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return { success: false, error: "Failed to load inventory" };
  }
}

// --- 1. الحصول على منتج واحد (لأغراض التعديل أو العرض) ---
export async function getProductByIdAction(id: string): Promise<ActionResponse<Product>> {
 const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const product = await db.product.findUnique({
      where: { id, userId: session.user.id },
      include: { category: true, brand: true }
    });
    
    if (!product) return { success: false, error: "Product not found" };
    
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: "Failed to fetch product" };
  }
}

// --- 2. تعديل المنتج (Edit) ---
export async function updateProductAction(id: string, data: any): Promise<ActionResponse<Product>> {
 const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    // نفصل المعرفات عن بقية البيانات للتأكد من صحتها
    const { categoryId, brandId, ...rest } = data;

    const updatedProduct = await db.product.update({
      where: { id, userId: session.user.id },
      data: {
        ...rest,
        barcode: rest.barcode?.trim() || null,
        categoryId: categoryId || null,
        brandId: brandId || null,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    revalidatePath("/dashboard/inventory");
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// --- 3. حذف منتج واحد (Delete) ---
export async function deleteProductAction(id: string): Promise<ActionResponse<null>> {
 const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const product = await db.product.findUnique({
      where: { id, userId: session.user.id },
      select: { image: true },
    });

    if (product?.image) {
      const filePath = product.image.split("products/")[1];
      if (filePath) await supabase.storage.from("products").remove([filePath]);
    }

    await db.product.delete({ where: { id, userId: session.user.id } });

    revalidatePath("/dashboard/inventory");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "فشل في حذف المنتج" };
  }
}

// --- 4. حذف مجموعة منتجات (Bulk Delete) ---
export async function bulkDeleteProductsAction(ids: string[]): Promise<ActionResponse<null>> {
 const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    const products = await db.product.findMany({
      where: { id: { in: ids }, userId: session.user.id },
      select: { image: true },
    });

    const filePaths = products
      .map((p) => p.image?.split("products/")[1])
      .filter(Boolean) as string[];

    if (filePaths.length > 0) {
      await supabase.storage.from("products").remove(filePaths);
    }

    await db.product.deleteMany({
      where: { id: { in: ids }, userId: session.user.id },
    });

    revalidatePath("/dashboard/inventory");
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: "فشل في حذف المنتجات" };
  }
}