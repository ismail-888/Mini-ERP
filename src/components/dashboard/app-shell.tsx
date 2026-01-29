"use client"

import type { ReactNode } from "react"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { TopBar } from "./top-bar"
import { BottomNavigation } from "./bottom-navigation"
import { ExchangeRateProvider } from "~/contexts/exchange-rate-context"
import { CartProvider } from "~/contexts/cart-context"

export function AppShell({ children, role }: { children: ReactNode; role: "admin" | "merchant" }) {
  return (
    <ExchangeRateProvider>
      <CartProvider>
        <SidebarProvider>
          {/* السايدبار يحتوي على عنوان "Mousaheb" في الهيدر الخاص به */}
          <AppSidebar role={role} />
          
          <SidebarInset className="flex flex-col min-h-screen">
            <TopBar role={role} />
            
            <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
              {children}
            </main>

            {/* تظهر فقط في الشاشات الصغيرة للمارشانت */}
            {role === "merchant" && (
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