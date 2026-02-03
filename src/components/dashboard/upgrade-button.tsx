"use client";

import { Button } from "~/components/ui/button";
import { Crown, Sparkles } from "lucide-react";

export function UpgradeButton() {
  const handleUpgrade = () => {
    // هنا سنضع رابط الـ Checkout الخاص بك مستقبلاً
    console.log("Redirecting to payment...");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="group relative w-full justify-start overflow-hidden border-emerald-500/20 bg-emerald-500/5 text-emerald-600 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500 hover:text-white shadow-sm"
      onClick={handleUpgrade}
    >
      <div className="flex items-center gap-2 relative z-10">
        <Crown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        <span className="font-bold text-xs">Upgrade Plan</span>
        <Sparkles className="h-3 w-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-emerald-400/20 to-indigo-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Button>
  );
}