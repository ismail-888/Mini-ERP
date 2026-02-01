import { auth } from "~/server/auth";
import { AppShell } from "~/components/dashboard/app-shell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();

  // حماية إضافية على مستوى السيرفر
  if (!session || session.user?.role !== "ADMIN") {
    redirect(`/${params.locale}/login`);
  }

  return (
    <AppShell role="ADMIN" user={session.user}>
      {children}
    </AppShell>
  );
}