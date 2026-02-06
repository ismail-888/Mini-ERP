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
  category: string;
  brand?: string;
  costPriceUSD: number;
  salePriceUSD: number;
  currentStock: number;
  minStockAlert: number;
  expiryDate?: Date | null;
  image?: string;
  // الحقول الجديدة
  discountValue?: number;
  discountType?: string;
  discountStartDate?: Date | null;
  discountEndDate?: Date | null;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    let imageUrl: string | null = null;

    // 1. معالجة الصورة
    if (data.image?.startsWith("data:image")) {
      try {
        const base64Data = data.image.split(",")[1];
        if (base64Data) {
          const buffer = Buffer.from(base64Data, "base64");
          const fileName = `${session.user.id}/${Date.now()}-${data.name.replace(/\s+/g, '-')}.png`;

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

    // 2. حفظ المنتج مع بيانات الخصم
    const product = await db.product.create({
      data: {
        name: data.name,
        barcode: data.barcode ?? null,
        category: data.category,
        brand: data.brand ?? null,
        costPriceUSD: data.costPriceUSD,
        salePriceUSD: data.salePriceUSD,
        currentStock: data.currentStock,
        minStockAlert: data.minStockAlert,
        expiryDate: data.expiryDate,
        image: imageUrl,
        userId: session.user.id,
        // إضافة حقول الخصم
        discountValue: data.discountValue ?? 0,
        discountType: data.discountType ?? "fixed",
        discountStartDate: data.discountStartDate ?? (data.discountValue ? new Date() : null), // إذا وضع خصم ولم يحدد تاريخ، يبدأ من الآن
        discountEndDate: data.discountEndDate ?? null,
      },
    });

    revalidatePath("/inventory");
    return { success: true, data: product };

  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: "الباركود هذا موجود مسبقاً في محلك" };
      }
    }
    console.error("General Action Error:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ المنتج" };
  }
}