"use server";

import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { RegisterSchema } from "~/lib/validations/auth";
import type { z } from "zod";

export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "بيانات غير صالحة" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "هذا البريد الإلكتروني مستخدم بالفعل" };
  }

  // حساب تاريخ انتهاء الفترة التجريبية (7 أيام من لحظة التسجيل)
  const trialDuration = 7 * 24 * 60 * 60 * 1000; // بالملي ثانية
  const trialEndsAt = new Date(Date.now() + trialDuration);

  // إنشاء المستخدم مع ضبط الخطة والتواريخ
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "MERCHANT",
      plan: "FREE_TRIAL", // الخطة الافتراضية
      status: "ACTIVE",    // الحالة نشطة في البداية
      trialEndsAt: trialEndsAt, // حفظ تاريخ الانتهاء
    },
  });

  return { success: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول." };
}