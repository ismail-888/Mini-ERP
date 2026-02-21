
"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import "~/styles/globals.css";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground antialiased">
        <div className="container flex max-w-5xl flex-col items-center gap-4 text-center">
          <div className="space-y-2">
            <h1 className="text-7xl font-bold tracking-tighter sm:text-9xl text-primary">
              404
            </h1>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Page Not Found / الصفحة غير موجودة
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl leading-normal sm:text-xl sm:leading-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
            </p>
            <p className="text-muted-foreground mx-auto max-w-2xl mb-8 leading-normal sm:text-lg" dir="rtl">
              عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد تكون نقلت أو غير موجودة.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild variant="default" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home / الرئيسية
              </Link>
            </Button>
            
            <Button 
               variant="outline" 
               size="lg"
               onClick={() => router.back()}
             >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back / رجوع
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
