import "~/styles/globals.css";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "~/components/theme-provider";
import { notFound } from 'next/navigation'; 
import { routing } from '~/i18n/routing'; 
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { Geist } from "next/font/google";
import ToasterProvider from "~/components/shared/ToasterProvider";

export const metadata: Metadata = {
  title: "Mousaheb",
  description: "Empowering Lebanese businesses with modern ERP & POS solutions. Your trusted partner for growth.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Gatekeeper: if language is not supported, return 404
  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const fontClass = locale === 'ar' ? 'font-arabic' : 'font-sans'; 

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${fontClass} ${geist.variable} antialiased`}>
        <TRPCReactProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex min-h-screen flex-col">
                {children}
                <ToasterProvider />
              </div>
            </ThemeProvider>
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}