"use client"

import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { TopBar } from "./top-bar"
import { BottomNavigation } from "./bottom-navigation"
import { ExchangeRateProvider } from "~/contexts/exchange-rate-context"
import { CartProvider } from "~/contexts/cart-context"

interface AppShellProps {
  children: ReactNode;
  role: "ADMIN" | "MERCHANT";
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    plan?: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL";
  };
}

export function AppShell({ children, role, user }: AppShellProps) {
  return (
    <ExchangeRateProvider>
      <CartProvider>
        <SidebarProvider>
          {/* نمرر الـ user هنا ليعرض البيانات الحقيقية */}
          <AppSidebar role={role} user={user} />
          
          <SidebarInset className="flex flex-col min-h-screen">
            <TopBar role={role} />
            
            <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
              {children}
            </main>

            {role === "MERCHANT" && (
              <div className="lg:hidden">
                <BottomNavigation />
              </div>
            )}
          </SidebarInset>
        </SidebarProvider>
      </CartProvider>
    </ExchangeRateProvider>
  )
}