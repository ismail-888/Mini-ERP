"use server";

import { signIn } from "~/server/auth";
import { LoginSchema } from "~/lib/validations/auth";
import { AuthError } from "next-auth";
import { db } from "~/server/db";
import { z } from "zod";

type LoginValues = z.infer<typeof LoginSchema>;

export async function login(values: LoginValues, locale: string) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  // 1. التحقق من وجود المستخدم ومعرفة رتبته
  const user = await db.user.findUnique({
    where: { email },
    select: { role: true },
  });

  if (!user) {
    return { error: "Email not found!" };
  }

  // 2. تحديد مسار التوجيه بناءً على الرتبة واللغة
  // ADMIN -> /ar/admin | MERCHANT -> /ar/dashboard
  const redirectPath = user.role === "ADMIN" 
    ? `/${locale}/admin` 
    : `/${locale}/dashboard`;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectPath,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    // ضروري جداً لـ Next.js ليقوم بعملية الـ Redirect
    throw error;
  }
}