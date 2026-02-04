import { auth } from "~/server/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Check, MessageCircle, Star } from "lucide-react";
import { Button } from "~/components/ui/button";

export default async function UpgradePage() {
  const session = await auth();
  const user = session?.user;

  const whatsappNumber = "9613326266"; // ضع رقمك هنا
  
  const plans = [
    {
      id: "SIX_MONTHS",
      name: "6 Months Pro",
      nameAr: "باقة ٦ أشهر",
      price: "$156",
      features: ["Unlimited Products", "Full Analytics", "Multi-user Access", "Priority Support"],
      message: `Hi! I want to upgrade my account (${user?.email}) to 6 Months Pro.`
    },
    {
      id: "ANNUAL",
      name: "Annual Pro",
      nameAr: "الباقة السنوية",
      price: "$290",
      popular: true,
      features: ["Everything in 6 Months", "Free Training Session", "Priority Feature Requests", "Best Value"],
      message: `Hi! I want to upgrade my account (${user?.email}) to the Annual Pro plan.`
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 font-arabic">ترقية اشتراكك</h1>
        <p className="text-muted-foreground">اختر الخطة التي تناسب حجم أعمالك</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-2xl scale-105' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1">
                <Star className="size-3 fill-current" /> BEST VALUE
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription className="font-arabic">{plan.nameAr}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-emerald-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>

              <Button asChild className="w-full gap-2 h-12 text-md font-bold" variant={plan.popular ? "default" : "outline"}>
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(plan.message)}`} target="_blank">
                  <MessageCircle className="size-5" />
                  Upgrade via WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-xl border border-dashed text-center max-w-2xl mx-auto">
        <h3 className="font-bold mb-2">كيف يتم التفعيل؟</h3>
        <p className="text-sm text-muted-foreground">
          بعد اختيار الخطة وإرسال الرسالة، سنرسل لك تفاصيل الدفع (Whish Money أو OMT). بمجرد إرسال صورة الإيصال، سيتم تفعيل حسابك يدوياً خلال دقائق.
        </p>
      </div>
    </div>
  );
}