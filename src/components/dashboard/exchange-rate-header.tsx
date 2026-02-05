"use client";

import { useState } from "react";
import { useExchangeRate } from "~/contexts/exchange-rate-context";
import { updateExchangeRate } from "~/server/actions/exchange-rate"; // تأكد من المسار الصحيح
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Save, RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner"; // أو أي مكتبة Toast تستخدمها
import { cn } from "~/lib/utils";

export function ExchangeRateHeader() {
  const { exchangeRate, setExchangeRate } = useExchangeRate();
  const [isPending, setIsPending] = useState(false);
  const [inputValue, setInputValue] = useState(exchangeRate.toString());

  const handleSave = async () => {
    const newRate = parseFloat(inputValue);
    
    if (isNaN(newRate) || newRate <= 0) {
      toast.error("يرجى إدخال رقم صحيح لسعر الصرف");
      return;
    }

    setIsPending(true);
    try {
      const result = await updateExchangeRate(newRate);
      
      if (result.success) {
        setExchangeRate(newRate);
        toast.success("تم تحديث سعر الصرف بنجاح");
      } else {
        toast.error(result.error ?? "فشل التحديث");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-background/50 p-1 rounded-lg border border-sidebar-border shadow-inner">
      <div className="flex items-center px-1 sm:px-2 text-muted-foreground group">
        <DollarSign className="size-3.5 sm:size-4 text-emerald-600 transition-transform group-hover:scale-110" />
        <span className="text-[10px] sm:text-xs font-bold ml-1 hidden xs:inline uppercase tracking-tighter">
          USD/LBP
        </span>
      </div>

      <div className="relative flex items-center">
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="h-8 w-20 sm:w-28 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm font-black p-0 sm:px-1"
          placeholder="Rate..."
          disabled={isPending}
        />
        <div className="absolute bottom-0 left-0 w-full h-px bg-primary/20" />
      </div>

      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-7 w-7 sm:h-8 sm:w-8 hover:bg-primary hover:text-white transition-all",
          isPending && "animate-pulse"
        )}
        onClick={handleSave}
        disabled={isPending || parseFloat(inputValue) === exchangeRate}
      >
        {isPending ? (
          <RefreshCw className="size-3.5 animate-spin" />
        ) : (
          <Save className="size-3.5 sm:size-4" />
        )}
      </Button>
    </div>
  );
}