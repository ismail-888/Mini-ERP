// src/app/[locale]/(dashboard)/layout.tsx

import { auth } from "~/server/auth";
import { AppShell } from "~/components/dashboard/app-shell";
import { redirect } from "next/navigation";
import { SubscriptionAlert } from "~/components/dashboard/subscription-alert";
import { getLatestExchangeRateAction } from "~/server/actions/exchange-rate";

export default async function DashboardLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  // 1. حماية المسار: إعادة التوجيه إذا لم يكن هناك جلسة نشطة
  if (!session) {
    redirect(`/${locale}/login`);
  }

  // 2. جلب أحدث سعر صرف (منطق الأولويات)
  // تم نقل منطق جلب السعر إلى ملف actions مستقل لزيادة الترتيب وإعادة الاستخدام
  // لا تقلق، هذا لا يؤثر على الأداء لأن الكود لا يزال يعمل على السيرفر (Server Component)
  const currentRate = await getLatestExchangeRateAction();

  return (
    <div className="flex flex-col min-h-screen">
      {/* عرض تنبيهات حالة الاشتراك */}
      <SubscriptionAlert user={session.user} />
      
      {/* تغليف لوحة التحكم بالـ AppShell وتمرير البيانات الأساسية وسعر الصرف */}
      <AppShell 
        role={session.user.role} 
        user={session.user} 
        initialExchangeRate={currentRate} 
      >
        {children}
      </AppShell>
    </div>
  );
}