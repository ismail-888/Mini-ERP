import { getTranslations } from "next-intl/server";
import { RegisterForm } from "~/components/auth/register-form";

export default async function RegisterPage() {
  const t = await getTranslations("auth");


  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("register_title")}</h1>
          <p className="text-muted-foreground">{t("register_subtitle")}</p>
        </div>
        
        <RegisterForm />
      </div>
    </div>
  );
}