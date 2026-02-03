"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react"; // استيراد دالة الخروج
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
import Link from "next/link";

export function AppSidebar({
  role,
  user,
  ...props
}: { 
  role: "ADMIN" | "MERCHANT";
  // تحديث النوع هنا ليشمل الحقول الحقيقية من الـ Session
  user?: { 
    name?: string | null; 
    email?: string | null; 
    plan?: "FREE_TRIAL" | "SIX_MONTHS" | "ANNUAL"; 
  }; 
} & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  // دالة مساعدة لتحويل الـ Enum إلى نص مقروء
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
          { title: t("dashboard"), url: "/dashboard", icon: Home },
          { title: "Point of Sale", url: "/dashboard/pos", icon: ShoppingCart },
          { title: "Inventory", url: "/dashboard/inventory", icon: Package },
          { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
        ];

  return (
    <Sidebar collapsible="icon" className="border-e-0" {...props}>
      {/* Header (Logo) - كما هو بدون تغيير */}
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

      {/* Content (Navigation) - كما هو بدون تغيير */}
      <SidebarContent className="bg-sidebar mt-4 overflow-x-hidden">
        <SidebarMenu className="px-2 gap-1.5">
          {navItems.map((item) => {
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
                    <div className="flex size-9 shrink-0 items-center justify-center">
                        <item.icon className={cn("size-5 transition-transform", isActive && "scale-110")} />
                    </div>
                    <span className="ml-2 truncate font-medium group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
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

      {/* Footer المحدث: بيانات ديناميكية و Dropdown للـ Logout */}
      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar/50 p-2 space-y-3 overflow-hidden">

      {role === "MERCHANT" && (
          <div className="px-2 group-data-[collapsible=icon]:hidden">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Current Plan
              </span>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                user?.plan === "FREE_TRIAL" 
                  ? "bg-amber-500/10 text-amber-600" 
                  : "bg-emerald-500/10 text-emerald-600"
              )}>
                {getPlanName(user?.plan)}
              </span>
            </div>
            {/* إظهار الزر فقط إذا لم يكن مشتركاً في الخطة السنوية مثلاً */}
            {user?.plan !== "ANNUAL" && <UpgradeButton />}
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full bg-accent/30 hover:bg-accent/50 transition-colors rounded-xl border border-transparent h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })} // دالة تسجيل الخروج
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