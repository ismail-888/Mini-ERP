import { auth } from "~/server/auth";
import { AppShell } from "~/components/dashboard/app-shell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  // حماية إضافية على مستوى السيرفر
  if (!session || session.user?.role !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  return (
    <AppShell role="ADMIN" user={session.user}>
      {children}
    </AppShell>
  );
}