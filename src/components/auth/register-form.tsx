"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { z } from "zod"; // استيراد عادي لاستخدامه في الـ resolver
import { RegisterSchema } from "~/lib/validations/auth";
import { register } from "~/server/actions/register";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

// استخدام import type فقط هنا لإرضاء الـ Linter
type RegisterFormValues = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  
  // استخدام useTransition أفضل للـ Server Actions في Next.js 15
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const data = await register(values);
        if (data?.error) {
          setError(data.error);
        } else if (data?.success) {
          setSuccess(data.success);
          form.reset(); // تفريغ الحقول عند النجاح
        }
      } catch (_err) {
        setError("Something went wrong!");
      }
    });
  };

  return (
    <Form {...form}>
      {/* void form.handleSubmit حل نهائي لمشكلة Unsafe call */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)(e);
        }} 
        className="space-y-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("full_name")}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="John Doe" 
                    disabled={isPending} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="example@test.com" 
                    type="email" 
                    disabled={isPending} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="******" 
                    type="password" 
                    disabled={isPending} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {error && (
          <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-500/15 p-3 rounded-md text-sm text-emerald-500 font-medium">
            {success}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("loading") : t("register_button")}
        </Button>
      </form>
    </Form>
  );
}