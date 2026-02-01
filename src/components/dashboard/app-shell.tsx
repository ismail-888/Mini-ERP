"use client"

import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { TopBar } from "./top-bar"
import { BottomNavigation } from "./bottom-navigation"
import { ExchangeRateProvider } from "~/contexts/exchange-rate-context"
import { CartProvider } from "~/contexts/cart-context"

// تحديث الـ Type ليتوافق مع الـ Enum في Prisma والـ Auth Config
export function AppShell({ 
  children, 
  role 
}: { 
  children: ReactNode; 
  role: "ADMIN" | "MERCHANT" 
}) {
  return (
    <ExchangeRateProvider>
      <CartProvider>
        <SidebarProvider>
          <AppSidebar role={role} />
          
          <SidebarInset className="flex flex-col min-h-screen">
            <TopBar role={role} />
            
            <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
              {children}
            </main>

            {/* الآن المقارنة ستنجح لأن الـ role القادم من السيرفر سيكون MERCHANT */}
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