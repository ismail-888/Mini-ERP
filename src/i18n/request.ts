import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is a Promise of the [locale] segment from the URL — must be awaited
  const locale = await requestLocale;
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