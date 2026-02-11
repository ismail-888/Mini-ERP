"use server"

import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { env } from "~/env";

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function createProductAction(data: {
  name: string;
  barcode?: string;
  // التغيير هنا: نستقبل معرفات (IDs)
  categoryId?: string | null;
  brandId?: string | null;
  costPriceUSD: number;
  salePriceUSD: number;
  currentStock: number;
  minStockAlert: number;
  expiryDate?: Date | null;
  image?: string;
  discountValue?: number;
  discountType?: string;
  discountStartDate?: Date | null;
  discountEndDate?: Date | null;
}) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  try {
    let imageUrl: string | null = null;
    const cleanBarcode = data.barcode?.trim() || null;
    const cleanName = data.name.trim();

    // 1. معالجة الصورة في Supabase
    if (data.image?.startsWith("data:image")) {
      try {
        const base64Data = data.image.split(",")[1];
        if (base64Data) {
          const buffer = Buffer.from(base64Data, "base64");
          const fileName = `${session.user.id}/${Date.now()}-${cleanName.replace(/\s+/g, '-')}.png`;

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, buffer, {
              contentType: "image/png",
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("products")
              .getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
          }
        }
      } catch (imageProcessingError) {
        console.error("Image processing failed:", imageProcessingError);
      }
    }

    // 2. التحقق من الباركود (فريد لكل مستخدم)
    if (cleanBarcode) {
      const exists = await db.product.findFirst({ 
        where: { barcode: cleanBarcode, userId: session.user.id } 
      });
      if (exists) return { success: false, error: "هذا الباركود مسجل لمنتج آخر لديك" };
    }

    // 3. حفظ المنتج في قاعدة البيانات مع العلاقات الجديدة
    const product = await db.product.create({
      data: {
        name: cleanName,
        barcode: cleanBarcode,
        image: imageUrl,
        costPriceUSD: data.costPriceUSD,
        salePriceUSD: data.salePriceUSD,
        currentStock: data.currentStock,
        minStockAlert: data.minStockAlert,
        expiryDate: data.expiryDate,
        userId: session.user.id,
        // ربط العلاقات بدلاً من النصوص
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        // حقول الخصم
        discountValue: data.discountValue ?? 0,
        discountType: data.discountType ?? "fixed",
        discountStartDate: data.discountStartDate ?? (data.discountValue ? new Date() : null),
        discountEndDate: data.discountEndDate ?? null,
      },
      // نقوم بعمل include لجلب بيانات الـ Category و الـ Brand فوراً
      include: {
        category: true,
        brand: true
      }
    });

    revalidatePath("/inventory");
    return { success: true, data: product };

  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: "الباركود موجود مسبقاً" };
      }
    }
    console.error("General Action Error:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ المنتج" };
  }
}