"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
// الـ Providers المهمة جداً للحسابات والسلة
import { ExchangeRateProvider } from "~/contexts/exchange-rate-context"
import { CartProvider } from "~/contexts/cart-context"
// المكونات التي تجعل الواجهة تعمل
import { ExchangeRateHeader } from "~/components/dashboard/exchange-rate-header"
import { BottomNavigation } from "~/components/dashboard/bottom-navigation"
import { DesktopSidebar } from "~/components/dashboard/desktop-sidebar"
import { cn } from "~/lib/utils"

interface AppShellProps {
  children: ReactNode;
  role: "admin" | "merchant";
}

export function AppShell({ children, role }: AppShellProps) {

  return (
    <ExchangeRateProvider>
      <CartProvider>
        <DesktopSidebar role={role} />
        
        <div className={cn("flex h-screen flex-col transition-all duration-300 lg:ml-64", role === "merchant" && "pt-14")}>
          {role === "merchant" && <ExchangeRateHeader />}
          <main
            className={cn(
              "min-h-screen pb-20 lg:pb-0"
            )}
          >
            <div className="p-4 lg:p-8">
              {children}
            </div>
          </main>
          {role === "merchant" && <BottomNavigation />}
        </div>
      </CartProvider>
    </ExchangeRateProvider>
  )
}