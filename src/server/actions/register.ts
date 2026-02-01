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

  // إنشاء المستخدم وتحديد الـ Role كـ MERCHANT افتراضياً
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "MERCHANT", 
    },
  });

  return { success: "تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول." };
}