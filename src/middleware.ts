import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from "~/server/auth";

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const locale = nextUrl.pathname.split('/')[1] ?? 'ar';

  const isAdminRoute = nextUrl.pathname.includes('/admin');
  const isDashboardRoute = nextUrl.pathname.includes('/dashboard');
  const isUpgradePage = nextUrl.pathname.includes('/upgrade');

  // --- 1. حماية مسارات الأدمن ---
  if (isAdminRoute && user?.role !== "ADMIN") {
    return Response.redirect(new URL(`/${locale}/dashboard`, nextUrl));
  }

  // --- 2. حماية مسارات الداشبورد (تسجيل الدخول) ---
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL(`/${locale}/login`, nextUrl));
  }

  // --- 3. منطق انتهاء الاشتراك وفترة السماح (للتاجر فقط) ---
  if (isDashboardRoute && user?.role === "MERCHANT" && !isUpgradePage) {
    
    // إذا كانت الحالة محددة يدوياً كمنتهية
    if (user.status === "EXPIRED") {
      return Response.redirect(new URL(`/${locale}/upgrade`, nextUrl));
    }

    // حساب فترة السماح (Grace Period)
    if (user.plan === "FREE_TRIAL" && user.trialEndsAt) {
      const trialEndDate = new Date(user.trialEndsAt);
      const graceEndDate = new Date(trialEndDate);
      graceEndDate.setDate(graceEndDate.getDate() + 3); // إضافة 3 أيام سماح

      const now = new Date();

      // إذا تخطى الوقت الحالي تاريخ انتهاء التجربة + أيام السماح
      if (now > graceEndDate) {
        return Response.redirect(new URL(`/${locale}/upgrade`, nextUrl));
      }
    }
    
    // ملاحظة: يمكنك هنا إضافة منطق مشابه للخطط المدفوعة (MONTHLY/ANNUAL) لاحقاً
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};