"use client"

import { SidebarTrigger } from "~/components/ui/sidebar"
import { ThemeToggle } from "~/components/theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { ExchangeRateHeader } from "./exchange-rate-header"
import { usePathname } from "next/navigation"
import { cn } from "~/lib/utils"

export function TopBar({ role }: { role: string }) {
  const pathname = usePathname()
  
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  const displaySegment = lastSegment === "en" || lastSegment === "ar" 
    ? "Dashboard" 
    : lastSegment

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-2 sm:px-4 shadow-sm">
      <div className="flex items-center gap-1 sm:gap-2">
        {/* استخدمنا -ms-1 ليكون متوافقاً مع RTL/LTR */}
        <SidebarTrigger className="-ms-1 h-8 w-8 hover:bg-accent transition-all shadow-sm border border-sidebar-border" />
        
        {/* إخفاء اسم الصفحة في الجوال (hidden) وإظهاره في الشاشات المتوسطة (md:flex) */}
        <div className="hidden md:flex items-center px-2">
           <span className="text-sm font-semibold text-foreground/80 capitalize tracking-tight">
             {displaySegment?.replace(/-/g, ' ') ?? "Home"}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {/* حاوية سعر الصرف - قد تحتاج بداخل مكون ExchangeRateHeader لجعل الخط أصغر في الجوال */}
        <div className="flex items-center">
          {role === "merchant" && <ExchangeRateHeader />}
        </div>
        
        {/* الفاصل يختفي في الجوال لزيادة المساحة */}
        <div className="h-4 w-px bg-sidebar-border mx-1 hidden md:block" />

        {/* أزرار التحكم */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}