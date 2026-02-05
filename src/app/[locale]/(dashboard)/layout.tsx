// src/app/[locale]/(dashboard)/layout.tsx

import { auth } from "~/server/auth";
import { db } from "~/server/db"; 
import { AppShell } from "~/components/dashboard/app-shell";
import { redirect } from "next/navigation";
import { SubscriptionAlert } from "~/components/dashboard/subscription-alert";

export default async function DashboardLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  // 1. حماية المسار: إعادة التوجيه إذا لم يكن هناك جلسة نشطة
  if (!session) {
    redirect(`/${params.locale}/login`);
  }

  // 2. جلب أحدث سعر صرف (منطق الأولويات)

  // أولاً: محاولة جلب السعر الخاص بالتاجر الحالي
  let latestRateEntry = await db.exchangeRate.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // ثانياً: إذا لم يوجد سعر خاص بالتاجر (null)، قم بجلب أحدث سعر وضعه الأدمن
  // المعامل ??= يُسمى "Nullish Coalescing Assignment". ببساطة، هو طريقة مختصرة وذكية لقول: "إذا كان هذا المتغير فارغاً، أعطه هذه القيمة؛ أما إذا كان لديه قيمة فعلاً، فاتركه كما هو".
  latestRateEntry ??= await db.exchangeRate.findFirst({
    where: { 
      user: { 
        role: "ADMIN" 
      } 
    },
    orderBy: { createdAt: 'desc' },
  });

  // القيمة النهائية: السعر المستخرج من الداتابيز أو القيمة الافتراضية 89000 في حال عدم وجود أي سجل
  const currentRate = latestRateEntry?.rate ?? 89000;

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