"use client";

import * as React from "react";
import {
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  ShieldCheck,
  Settings,
  User2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "~/components/ui/sidebar";

export function AppSidebar({
  role,
  ...props
}: { role: "admin" | "merchant" } & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navItems =
    role === "admin"
      ? [
          { title: "Admin Overview", url: "/admin", icon: ShieldCheck },
          { title: "Shops", url: "/admin/shops", icon: Home },
          { title: "Settings", url: "/admin/settings", icon: Settings },
        ]
      : [
          { title: "Dashboard", url: "/dashboard", icon: Home },
          { title: "Point of Sale", url: "/dashboard/pos", icon: ShoppingCart },
          { title: "Inventory", url: "/dashboard/inventory", icon: Package },
          { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
        ];

  return (
    <Sidebar collapsible="icon" {...props} >
      <SidebarHeader className="border-sidebar-border/50 border-b bg-sidebar">
        <SidebarMenu className="">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="font-bold">M</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-lg font-bold">Mousaheb</span>
                <span className="text-muted-foreground text-xs">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarMenu className="px-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.url}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar">
        {/* هنا نضع معلومات المستخدم كما في الصورة */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <User2 className="size-4" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Ismail BK</span>
                <span className="truncate text-xs">Owner</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
