"use client"

import { SidebarTrigger } from "~/components/ui/sidebar"
// import { Separator } from "~/components/ui/separator"
import { ThemeToggle } from "~/components/theme-toggle"
import { ExchangeRateHeader } from "./exchange-rate-header"
import { usePathname } from "next/navigation"

export function TopBar({ role }: { role: string }) {
  const pathname = usePathname()
  
  // منطق بسيط لاستخراج اسم الصفحة الحالية للـ Breadcrumb
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] ?? "Home"

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center">
           <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default capitalize">
             {lastSegment.replace(/-/g, ' ')}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {role === "merchant" && <ExchangeRateHeader />}
        <ThemeToggle />
      </div>
    </header>
  )
}