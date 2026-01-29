"use client"

import { Package, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { useExchangeRate } from "~/contexts/exchange-rate-context"

const quickStats = [
  {
    title: "Today's Sales",
    value: "$1,234.50",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Products",
    value: "156",
    change: "+3",
    icon: Package,
    trend: "up",
  },
  {
    title: "Orders",
    value: "28",
    change: "+8",
    icon: ShoppingCart,
    trend: "up",
  },
  {
    title: "Revenue",
    value: "$8,450",
    change: "+18.2%",
    icon: TrendingUp,
    trend: "up",
  },
]

export default function HomePage() {
  const { rate, formatLBP } = useExchangeRate()

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground lg:text-sm">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold lg:text-2xl">{stat.value}</div>
                <p className="mt-1 text-xs text-primary">{stat.change} from yesterday</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link href="/pos">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">New Sale</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/inventory">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Add Product</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reports">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">View Reports</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin">
            <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <DollarSign className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="text-sm font-medium">Admin</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Exchange Rate Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Current Exchange Rate
            </p>
            <p className="text-2xl font-bold text-primary">
              $1 = {new Intl.NumberFormat("en-US").format(rate.usdToLBP)} LBP
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/pos">Start Selling</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
