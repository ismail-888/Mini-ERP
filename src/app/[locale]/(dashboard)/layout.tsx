import { auth } from "~/server/auth";
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

  if (!session) {
    redirect(`/${params.locale}/login`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* تمرير بيانات المستخدم هنا مباشرة */}
      <SubscriptionAlert user={session.user} />
      
      <AppShell role={session.user.role} user={session.user}>
        {children}
      </AppShell>
    </div>
  );
}