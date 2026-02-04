"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Check, Sparkles, Zap } from "lucide-react";
import { MarketingButton } from "./MarketingButton";
import { Link } from "~/i18n/routing";

const PricingSection = () => {

  // الوجهة دائماً للتسجيل بما أننا في صفحة الهبوط
  const registerHref = "/register";

  const plans = [
    {
      id: "FREE_TRIAL",
      name: "Free Trial",
      nameAr: "تجربة مجانية",
      price: "0",
      period: "7 days",
      description: "Try all features with zero cost",
      features: [
        "Full access to all features",
        "Up to 100 products",
        "Basic support",
        "Dual-currency POS",
        "Inventory management",
      ],
      cta: "Start Free Trial", // نص ثابت
      variant: "outline" as const,
      badge: "No Credit Card",
    },
    {
      id: "SIX_MONTHS",
      name: "6 Months",
      nameAr: "٦ أشهر",
      price: "156",
      originalPrice: "174",
      period: "/6 months",
      description: "Save 10% with semi-annual billing",
      features: [
        "Unlimited products",
        "Advanced analytics",
        "Priority support",
        "Multi-user access",
        "Everything in Trial",
        "White-label options",
      ],
      cta: "Save 10%",
      variant: "default" as const,
      badge: "10% OFF",
      popular: true,
    },
    {
      id: "ANNUAL",
      name: "Annual",
      nameAr: "سنوي",
      price: "290",
      originalPrice: "348",
      period: "/year",
      description: "Best value — 2 months free!",
      features: [
        "Everything in 6 Months",
        "Free onboarding",
        "Custom integrations",
        "SLA guarantee",
        "Unlimited API calls",
        "Priority security updates",
      ],
      cta: "Get 2 Months Free",
      variant: "emerald" as const,
      badge: "Best Value",
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-accent text-accent">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent
            <span className="text-gradient block mt-2 py-1">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Grid - Responsive: 1 col on mobile, 3 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative flex flex-col h-full border-0 shadow-xl transition-all duration-300 group ${
                plan.popular ? 'ring-2 ring-accent scale-105 z-10' : 'is-regular'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full flex justify-center">
                  <Badge 
                    className={`px-3 py-1 whitespace-nowrap ${
                      plan.id === "ANNUAL" 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {plan.id === "ANNUAL" && <Sparkles className="w-3 h-3 mr-1 inline" />}
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-xl text-foreground">{plan.name}</h3>
                  {plan.popular && <Zap className="w-5 h-5 text-accent fill-accent" />}
                </div>
                <p className="text-sm text-muted-foreground font-arabic mb-4">{plan.nameAr}</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                
                {plan.originalPrice && (
                  <p className="text-[12px] text-muted-foreground mt-1">
                    <span className="line-through">${plan.originalPrice}</span>
                    <span className="text-accent ml-2 font-semibold">Save ${Number(plan.originalPrice) - Number(plan.price)}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex flex-col justify-between grow">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-accent/10 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                      </div>
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* الرابط يوجه دائماً للـ register */}
                <Link href={registerHref} className="w-full">
                  <MarketingButton variant={plan.variant} className="w-full shadow-lg font-bold" size="lg">
                    {plan.cta}
                  </MarketingButton>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;