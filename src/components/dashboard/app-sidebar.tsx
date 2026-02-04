"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { UpgradeButton } from "./upgrade-button";
import { usePathname } from "~/i18n/routing";
import {
  Home,
  ShoppingCart,
  Package,
  BarChart3,
  ShieldCheck,
  Settings,
  User2,
  LogOut,
  ChevronUp,
  LayoutDashboard,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { Link } from "~/i18n/routing"; // تأكد من استخدام Link من i18n/routing

export function AppSidebar({
  role,
  user,
  ...props
}: { 
  role: "ADMIN" | "MERCHANT";
  user?: { 
    name?: string | null; 
    email?: string | null; 
    plan?: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL"; 
  }; 
} & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const getPlanName = (plan?: string | null) => {
    switch (plan) {
      case "FREE_TRIAL": return "Free Trial";
      case "SIX_MONTHS": return "6 Months Pro";
      case "ANNUAL": return "Annual Pro";
      default: return "Free Trial";
    }
  };

  const navItems =
    role === "ADMIN"
      ? [
          { title: t("admin_overview"), url: "/admin", icon: ShieldCheck },
          { title: "Active Shops", url: "/admin/shops", icon: Home },
          { title: "Settings", url: "/admin/settings", icon: Settings },
        ]
      : [
          { title: t("dashboard"), url: "/dashboard", icon: LayoutDashboard },
          { title: "Point of Sale", url: "/dashboard/pos", icon: ShoppingCart },
          { title: "Inventory", url: "/dashboard/inventory", icon: Package },
          { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
        ];

  return (
    <Sidebar collapsible="icon" className="border-e-0" {...props}>
      {/* Header (Logo) */}
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
              <div className="flex flex-col gap-0.5 leading-none px-2 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-bold tracking-tight uppercase italic text-primary">Mousaheb</span>
                <span className="text-[10px] font-medium text-muted-foreground/70">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content (Navigation) */}
      <SidebarContent className="bg-sidebar mt-4 overflow-x-hidden">
        <SidebarMenu className="px-2 gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));

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
                    <div className="flex size-9 shrink-0 items-center justify-center">
                        <item.icon className={cn("size-5 transition-transform", isActive && "scale-110")} />
                    </div>
                    <span className="ml-2 truncate font-medium group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar/50 p-2 space-y-3 overflow-hidden">
      
      {/* 1. قسم الاشتراك المحدث */}
      {role === "MERCHANT" && (
          <div className="px-2 group-data-[collapsible=icon]:hidden">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 font-sans">
                Plan
              </span>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                user?.plan === "FREE_TRIAL" 
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              )}>
                {getPlanName(user?.plan)}
              </span>
            </div>
            {/* إظهار زر الترقية إذا لم يكن قد وصل لأعلى باقة */}
            {user?.plan !== "ANNUAL" && (
              <div className="mt-2">
                <UpgradeButton />
              </div>
            )}
          </div>
        )}

        {/* 2. قائمة المستخدم والـ Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full bg-accent/30 hover:bg-accent/50 transition-colors rounded-xl border border-transparent h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 cursor-pointer"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary cursor-pointer">
                    <User2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-xs leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-foreground">
                        {user?.name ?? "User"} 
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground uppercase tracking-widest">
                        {role}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-3 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg p-2"
                align="center"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center w-full cursor-pointer">
                    <Settings className="mr-2 size-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}