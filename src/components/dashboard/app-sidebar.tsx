"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "~/i18n/routing";
import {
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  ShieldCheck,
  Settings,
  User2,
  ChevronRight,
} from "lucide-react";
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
import { cn } from "~/lib/utils";
import Link from "next/link";

export function AppSidebar({
  role,
  ...props
}: { role: "ADMIN" | "MERCHANT" } & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const  t  = useTranslations("sidebar");

  const navItems =
    role === "ADMIN"
      ? [
          { title: t("admin_overview"), url: "/admin", icon: ShieldCheck },
          { title: "Active Shops", url: "/admin/shops", icon: Home },
          { title: "Settings", url: "/admin/settings", icon: Settings },
        ]
      : [
          { title: t("dashboard"), url: "/dashboard", icon: Home },
          { title: "Point of Sale", url: "/dashboard/pos", icon: ShoppingCart },
          { title: "Inventory", url: "/dashboard/inventory", icon: Package },
          { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
        ];

  return (
    <Sidebar collapsible="icon" className="border-e-0" {...props}>
      {/* Header: Centered Logo for Collapsed State */}
      <SidebarHeader className="h-16 border-b border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm overflow-hidden flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton 
              size="lg" 
              className="hover:bg-transparent pointer-events-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 text-primary-foreground">
                <span className="font-black text-lg">M</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none px-2 group-data-[collapsible=icon]:hidden ">
                <span className="text-sm font-bold tracking-tight uppercase">Mousaheb</span>
                <span className="text-[10px] font-medium text-muted-foreground/70">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content: Fix for Link styling persistence */}
      <SidebarContent className="bg-sidebar mt-4 overflow-x-hidden">
        <SidebarMenu className="px-2 gap-1.5">
          {navItems.map((item) => {
            // Section roots (/admin, /dashboard) active only on exact match; others also on sub-routes
            const isSectionRoot = item.url === "/admin" || item.url === "/dashboard";
            const isActive = isSectionRoot
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(`${item.url}/`);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="h-11 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                >
                  <Link 
                    href={item.url} 
                    className={cn(
                      "flex items-center w-full relative transition-all duration-200 rounded-md",
                      isActive 
                        ? "bg-primary/10 text-primary font-bold shadow-sm" 
                        : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Icon Container: Centered at 4.5rem width */}
                    <div className="flex size-9 shrink-0 items-center justify-center">
                        <item.icon className={cn("size-5 transition-transform", isActive && "scale-110")} />
                    </div>
                    
                    {/* Labels: Hidden in icon mode */}
                    <span className="ml-2 truncate font-medium group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>

                    {/* Left Indicator: Adjusted for collapsed mode */}
                    {isActive && (
                      <span className={cn(
                        "absolute inset-y-2.5 w-1 rounded-full bg-primary",
                        "left-0 group-data-[collapsible=icon]:left-[2px]" 
                      )} />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer: Centered User Profile */}
      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar/50 p-2 overflow-hidden flex items-center justify-center">
        <SidebarMenu className="w-full">
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              size="lg"
              className="w-full bg-accent/30 hover:bg-accent/50 transition-colors rounded-xl border border-transparent h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-xs leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-foreground">Ismail BK</span>
                <span className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">Owner</span>
              </div>
              <ChevronRight className="ml-auto size-3 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}