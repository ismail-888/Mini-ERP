import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // تأكد من أن الـ matcher يغطي كل شيء ما عدا الـ api والملفات الثابتة
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};