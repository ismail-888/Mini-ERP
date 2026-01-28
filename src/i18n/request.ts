import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  // التأكد من أن الـ locale مدعوم، وإلا نستخدم اللغة الافتراضية
  // هذا يحل مشكلة "string | undefined"
  const currentLocale = routing.locales.includes(locale as "en" | "ar") 
    ? (locale as "en" | "ar") 
    : routing.defaultLocale;


    const messagesModule = (await import(`../messages/${currentLocale}.json`)) as {
      default: Record<string, string>;
    };

    return {
      locale: currentLocale,
      messages: messagesModule.default
    };
});