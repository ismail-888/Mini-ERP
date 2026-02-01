"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { LoginSchema } from "~/lib/validations/auth";
import { login } from "~/server/actions/login";

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

type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string;
  
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setError("");

    startTransition(async () => {
      try {
        const data = await login(values, locale);
        if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        // إذا حدث Redirect، سيقوم Next.js بإلقاء خطأ داخلي، نتجاهله هنا
      }
    });
  };

  return (
    <Form {...form}>
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? t("loading") : t("login_button")}
        </Button>
      </form>
    </Form>
  );
}