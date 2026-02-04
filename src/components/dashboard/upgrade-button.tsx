"use client";

import { Crown, Sparkles } from "lucide-react";
import { Link } from "~/i18n/routing";
import { cn } from "~/lib/utils";

export function UpgradeButton({ className }: { className?: string }) {
  return (
    <Link href="/dashboard/upgrade" className="w-full block">
      <button
        className={cn(
          "group relative w-full flex items-center justify-start h-10 px-3 overflow-hidden rounded-lg cursor-pointer",
          "border border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
          "transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500 hover:text-white shadow-sm",
          className
        )}
      >
        <div className="flex items-center gap-2 relative z-10">
          <Crown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          <span className="font-bold text-xs uppercase tracking-tight">Upgrade Plan</span>
          <Sparkles className="h-3 w-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>
    </Link>
  );
}