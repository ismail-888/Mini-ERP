"use client";

import { AlertTriangle, X, Calendar } from "lucide-react";
import { Link } from "~/i18n/routing";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { type Session } from "next-auth"; // استيراد التايب

interface SubscriptionAlertProps {
  user: Session["user"]; // نستقبل بيانات المستخدم من السيرفر
}

export function SubscriptionAlert({ user }: SubscriptionAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // لا يظهر للأدمن أو إذا أُغلق يدوياً
  if (!user || user.role === "ADMIN" || !isVisible) return null;

  const targetDate = user.plan === "FREE_TRIAL" ? user.trialEndsAt : user.subscriptionEndsAt;
  
  if (!targetDate) return null;

  const now = new Date();
  const endDate = new Date(targetDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isProEndingSoon = user.plan !== "FREE_TRIAL" && diffDays <= 7 && diffDays > 0;
  const isTrialEndingSoon = user.plan === "FREE_TRIAL" && diffDays <= 3 && diffDays > 0;
  const isGracePeriod = diffDays <= 0 && diffDays >= -3;

  if (!isProEndingSoon && !isTrialEndingSoon && !isGracePeriod) return null;

  return (
    <div className={cn(
      "relative w-full px-4 py-2.5 sm:px-6 flex items-center justify-between transition-all duration-300 shadow-sm z-50",
      isGracePeriod ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"
    )}>
      <div className="flex items-center gap-3 max-w-[90%]">
        <div className="shrink-0 p-1 bg-white/20 rounded-full hidden xs:flex">
          {isGracePeriod ? <AlertTriangle className="size-4" /> : <Calendar className="size-4" />}
        </div>
        
        <p className="text-[12px] sm:text-sm font-medium leading-tight">
          {isGracePeriod ? (
            <>انتهى اشتراكك! لديك {3 + diffDays} أيام قبل إغلاق الحساب.</>
          ) : user.plan === "FREE_TRIAL" ? (
            <>بقي {diffDays} أيام على انتهاء التجربة.</>
          ) : (
            <>سينتهي اشتراكك الاحترافي خلال {diffDays} أيام.</>
          )}
          <Link href="/dashboard/upgrade" className="inline-block mr-2 underline underline-offset-4 font-bold hover:text-white/80 transition-colors">
             {user.plan === "FREE_TRIAL" ? "اشترك الآن" : "تجديد الاشتراك"}
          </Link>
        </p>
      </div>

      <button onClick={() => setIsVisible(false)} className="shrink-0 p-1 rounded-md transition-colors hover:bg-black/10">
        <X className="size-4" />
      </button>
    </div>
  );
}