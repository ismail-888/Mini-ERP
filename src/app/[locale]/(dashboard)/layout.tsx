import { auth } from "~/server/auth";
import { AppShell } from "~/components/dashboard/app-shell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  // إذا لم يكن مسجل دخول، يوجهه لصفحة الدخول
  if (!session) {
    redirect(`/${params.locale}/login`);
  }

  return (
    <AppShell role="MERCHANT" user={session.user}>
      {children}
    </AppShell>
  );
}