import { getTranslations } from "next-intl/server";
import { LoginForm } from "~/components/auth/login-form";
import { Link } from "~/i18n/routing";
import { ArrowLeft, Home } from "lucide-react";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-[420px] space-y-6">
        
        {/* تصميم جديد لزر العودة: فوق البطاقة مباشرة وبعرض واضح */}
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all mb-2 w-fit mx-auto sm:mx-0"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-card border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </div>
          <span>{t("back_to_home")}</span>
        </Link>

        <div className="space-y-8 p-6 sm:p-10 border bg-card rounded-3xl shadow-xl shadow-black/5 relative overflow-hidden">
          {/* لمسة جمالية: خلفية باهتة في ركن البطاقة */}
          <div className="absolute -top-10 -right-10 size-32 bg-primary/5 rounded-full blur-3xl" />

          <div className="text-center space-y-2 relative">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {t("login_title")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("login_subtitle")}
            </p>
          </div>

          <LoginForm />
          
          <div className="space-y-4 pt-2">
             <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
             </div>

             <p className="text-center text-sm text-muted-foreground">
               {t("dont_have_account")}{" "}
               <Link href="/register" className="text-primary hover:underline font-bold">
                 {t("register_link")}
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}