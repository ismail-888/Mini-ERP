"use client"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card"
import { useExchangeRate } from "~/contexts/exchange-rate-context"

const salesData = [
  { month: "Jan", sales: 4200 },
  { month: "Feb", sales: 3800 },
  { month: "Mar", sales: 5100 },
  { month: "Apr", sales: 4600 },
  { month: "May", sales: 5800 },
  { month: "Jun", sales: 6200 },
]

const topProducts = [
  { name: "Premium Coffee Beans", sales: 156, revenue: 2025.44 },
  { name: "Wireless Earbuds", sales: 89, revenue: 2669.11 },
  { name: "Organic Olive Oil", sales: 72, revenue: 1332.00 },
  { name: "Leather Wallet", sales: 45, revenue: 1575.00 },
  { name: "Herbal Tea Set", sales: 38, revenue: 579.50 },
]

export default function ReportsPage() {
  const { formatUSD, formatLBP, convertToLBP } = useExchangeRate()

  const totalRevenue = 24680
  const totalOrders = 847
  const averageOrder = totalRevenue / totalOrders
  const growthRate = 12.5

  return (
    <div className="px-4 py-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Business analytics and performance insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(totalRevenue)}</div>
            <div className="mt-1 flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+{growthRate}%</span>
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="mt-1 flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+8.2%</span>
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Order Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(averageOrder)}</div>
            <div className="mt-1 flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-primary" />
              <span className="text-primary">+4.1%</span>
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Sold
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="mt-1 flex items-center text-xs">
              <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
              <span className="text-destructive">-2.4%</span>
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Revenue trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <div className="flex h-full items-end gap-2">
                {salesData.map((data) => {
                  const maxSales = Math.max(...salesData.map((d) => d.sales))
                  const height = (data.sales / maxSales) * 100
                  return (
                    <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t-md bg-primary transition-all hover:bg-primary/80"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{data.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue in LBP */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Current exchange rate applied</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total in USD</p>
              <p className="text-3xl font-bold text-foreground">{formatUSD(totalRevenue)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Total in LBP</p>
              <p className="text-2xl font-bold text-primary">
                {formatLBP(convertToLBP(totalRevenue))}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-lg font-semibold">{formatUSD(5420)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-semibold">{formatUSD(1234.50)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performers this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatUSD(product.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatLBP(convertToLBP(product.revenue))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
