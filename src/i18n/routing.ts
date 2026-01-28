import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always' // غيرها من as-needed إلى always لضمان عدم حدوث 404 في البداية
});

// هذه الوظائف سنستخدمها لاحقاً للتنقل بين الصفحات برمجياً
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);