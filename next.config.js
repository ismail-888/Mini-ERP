/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import createNextIntlPlugin from 'next-intl/plugin';

// نقوم بتحديد مسار ملف الإعدادات يدوياً لأننا وضعناه داخل مجلد i18n
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import("next").NextConfig} */
const config = {
    // يمكنك إضافة أي إعدادات خاصة بـ Next.js هنا مستقبلاً
    reactStrictMode: true,
};

export default withNextIntl(config);