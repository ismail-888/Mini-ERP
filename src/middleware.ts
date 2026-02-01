import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from "~/server/auth"; // تأكد من المسار الصحيح لملف auth الخاص بك

// 1. إنشاء ميدل وير الترجمة
const intlMiddleware = createMiddleware(routing);

// 2. دمج الترجمة مع المصادقة
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // استخراج الـ Locale الحالي من الرابط (ar أو en)
  const locale = nextUrl.pathname.split('/')[1] ?? 'ar';

  // --- منطق الحماية (Route Guards) ---
  
  const isAdminRoute = nextUrl.pathname.includes('/admin');
  const isDashboardRoute = nextUrl.pathname.includes('/dashboard');

  // إذا حاول دخول صفحة Admin وهو ليس Admin
  if (isAdminRoute && userRole !== "ADMIN") {
    return Response.redirect(new URL(`/${locale}/dashboard`, nextUrl));
  }

  // إذا حاول دخول Dashboard وهو غير مسجل دخول
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL(`/${locale}/login`, nextUrl));
  }

  // تنفيذ منطق الترجمة الافتراضي
  return intlMiddleware(req);
});

export const config = {
  // تغطية كل المسارات ما عدا الملفات التقنية
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};