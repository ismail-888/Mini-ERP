"use client"

import { Package, ShoppingCart, TrendingUp, DollarSign, ArrowUpRight, Zap } from "lucide-react"
import { Link } from "~/i18n/routing" // استخدام Link المترجم
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { useExchangeRate } from "~/contexts/exchange-rate-context"
import { cn } from "~/lib/utils"

const quickStats = [
  {
    title: "Today's Sales",
    value: "$1,234.50",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Products",
    value: "156",
    change: "+3",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    title: "Orders",
    value: "28",
    change: "+8",
    icon: ShoppingCart,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
  },
  {
    title: "Revenue",
    value: "$8,450",
    change: "+18.2%",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-indigo-500/10",
  },
]

const quickActions = [
  {
    title: "New Sale",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    description: "Open POS terminal",
    color: "bg-emerald-500",
  },
  {
    title: "Add Product",
    href: "/dashboard/inventory",
    icon: Package,
    description: "Manage your stock",
    color: "bg-blue-500",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: TrendingUp,
    description: "Financial overview",
    color: "bg-indigo-500",
  },
]

export default function HomePage() {
  const { exchangeRate, formatLBP } = useExchangeRate()

  return (
    <div className="space-y-8 ">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground lg:text-4xl">
          Welcome back <span className="text-primary">!</span>
        </h1>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
          Everything looks great with your store today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-black tracking-tight">{stat.value}</div>
              <div className="flex items-center mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/5 w-fit px-1.5 py-0.5 rounded">
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Container */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Actions Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-md active:scale-95 border-dashed">
                  <CardContent className="flex flex-row items-center gap-4 p-4">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-primary/10 transition-transform group-hover:scale-110", action.color)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight">{action.title}</span>
                      <span className="text-[10px] text-muted-foreground">{action.description}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Exchange Rate Status Card */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Store Currency
          </h2>
          <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Current Rate</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">
                    $1 = {new Intl.NumberFormat("en-US").format(exchangeRate)} <span className="text-xs font-medium text-muted-foreground">LBP</span>
                  </p>
                </div>
                <Button size="sm" className="w-full font-bold shadow-lg shadow-primary/20" asChild>
                  <Link href="/dashboard/pos">
                    Launch POS Terminal
                  </Link>
                </Button>
              </div>
            </CardContent>
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
              <DollarSign size={100} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}