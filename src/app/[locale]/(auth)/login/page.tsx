import { getTranslations } from "next-intl/server";
import { LoginForm } from "~/components/auth/login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 border rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("login_title")}</h1>
          <p className="text-muted-foreground">{t("login_subtitle")}</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}