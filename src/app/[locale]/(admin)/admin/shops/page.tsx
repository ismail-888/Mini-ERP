"use client"

import { useState } from "react"
import { Store, Search, MoreHorizontal, Calendar, Package, DollarSign } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Switch } from "~/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { mockShops } from "~/lib/mock-data"
import type { Shop } from "~/lib/types"
import { cn } from "~/lib/utils"

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>(mockShops)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleShopStatus = (shopId: string) => {
    setShops((current) =>
      current.map((shop) =>
        shop.id === shopId
          ? { ...shop, status: shop.status === "active" ? "suspended" : "active" }
          : shop
      )
    )
  }

  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (date: string) => {
    return new Date(date) < new Date()
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Active Shops</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage shop accounts and subscriptions
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shops, owners, or emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Shop</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Subscription Expiry</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-right">Sales (Month)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{shop.owner}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        isExpired(shop.subscriptionExpiry)
                          ? "text-destructive"
                          : isExpiringSoon(shop.subscriptionExpiry)
                            ? "text-warning"
                            : "text-foreground"
                      )}
                    >
                      {new Date(shop.subscriptionExpiry).toLocaleDateString()}
                    </span>
                    {isExpired(shop.subscriptionExpiry) && (
                      <Badge variant="destructive" className="text-[10px]">
                        Expired
                      </Badge>
                    )}
                    {isExpiringSoon(shop.subscriptionExpiry) && (
                      <Badge
                        variant="outline"
                        className="border-warning bg-warning/10 text-[10px] text-warning-foreground"
                      >
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">{shop.productsCount}</TableCell>
                <TableCell className="text-right font-medium">
                  ${shop.salesThisMonth.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={shop.status === "active"}
                      onCheckedChange={() => toggleShopStatus(shop.id)}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        shop.status === "active" ? "text-primary" : "text-destructive"
                      )}
                    >
                      {shop.status === "active" ? "Active" : "Suspended"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Extend Subscription</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete Shop
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {filteredShops.map((shop) => (
          <Card key={shop.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Store className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{shop.name}</CardTitle>
                    <CardDescription>{shop.owner}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={shop.status === "active"}
                    onCheckedChange={() => toggleShopStatus(shop.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expires</p>
                    <p
                      className={cn(
                        "font-medium",
                        isExpired(shop.subscriptionExpiry)
                          ? "text-destructive"
                          : isExpiringSoon(shop.subscriptionExpiry)
                            ? "text-warning"
                            : ""
                      )}
                    >
                      {new Date(shop.subscriptionExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="font-medium">{shop.productsCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sales</p>
                    <p className="font-medium">${shop.salesThisMonth.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Store className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">No shops found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  )
}
