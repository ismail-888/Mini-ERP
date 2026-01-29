"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, Package, BarChart3, ShieldCheck } from "lucide-react"
import { cn } from "~/lib/utils"
import { useCart } from "~/contexts/cart-context"

// نستخدم مصفوفة موحدة، وسنتحكم فيما يظهر بناءً على الـ Role
const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/pos", label: "Point of Sale", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
]

export function DesktopSidebar({ role }: { role: "admin" | "merchant" }) {
  const pathname = usePathname()
  const { itemCount } = useCart()

  // إذا كان المستخدم أدمن، نغير الروابط تماماً لتناسبه
  const displayItems = role === "admin" 
    ? [
        { href: "/admin", label: "Admin Home", icon: ShieldCheck },
        { href: "/admin/shops", label: "Active Shops", icon: Home },
      ]
    : navItems;

  return (
    // السر هنا: inset-y-0 مع start-0 تجعل السايدبار يمين في العربي ويسار في الانجليزي
    <aside className="fixed inset-y-0 start-0  hidden w-64 border-e-0 bg-linear-to-b from-background to-muted/20 lg:block pt-14">
        <div className="flex h-full flex-col px-3 py-6">
          <nav className="flex-1 space-y-1">
          {displayItems.map((item) => {
            // نتحقق إذا كان الرابط الحالي ينتهي بنفس مسار العنصر
            const isActive = pathname.includes(item.href)
            const Icon = item.icon
            const showBadge = item.href === "/pos" && itemCount > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -inline-end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {itemCount}
                    </span>
                  )}
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}