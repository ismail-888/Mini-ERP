import "~/styles/globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // لا تضع <html> أو <body> هنا لتجنب التكرار مع layouts المجلدات الفرعية
  return (
    <TRPCReactProvider>
      <div className={geist.variable}>
        {children}
        <ToasterProvider />
      </div>
    </TRPCReactProvider>
  );
}
