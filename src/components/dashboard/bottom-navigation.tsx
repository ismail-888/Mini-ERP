"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, Package, BarChart3 } from "lucide-react"
import { cn } from "~/lib/utils"
import { useCart } from "~/contexts/cart-context"

// تحديث الروابط لتشمل /dashboard
const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/pos", label: "POS", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  // بدلاً من startWith، نتحقق إذا كان الرابط يحتوي على كلمة admin 
  // لضمان عملها مع اللغات مثل /en/admin أو /ar/admin
  if (pathname.includes("/admin")) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          // التحقق من الحالة النشطة بشكل أدق
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          const showBadge = item.href.includes("/pos") && itemCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-all",
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {showBadge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className={cn("transition-all", isActive ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}