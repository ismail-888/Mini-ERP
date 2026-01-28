import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Check, Sparkles, Zap } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
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
      cta: "Start Free Trial",
      variant: "outline" as const,
      badge: "No Credit Card",
    },
    {
      name: "Monthly",
      nameAr: "شهري",
      price: "29",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Unlimited products",
        "Advanced analytics",
        "Priority support",
        "Multi-user access",
        "Custom reports",
        "API access",
      ],
      cta: "Get Started",
      variant: "default" as const,
    },
    {
      name: "6 Months",
      nameAr: "٦ أشهر",
      price: "156",
      originalPrice: "174",
      period: "/6 months",
      description: "Save 10% with semi-annual billing",
      features: [
        "Everything in Monthly",
        "Dedicated account manager",
        "Training sessions",
        "Priority feature requests",
        "Extended data retention",
        "White-label options",
      ],
      cta: "Save 10%",
      variant: "default" as const,
      badge: "10% OFF",
      popular: true,
    },
    {
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
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-accent text-accent">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent
            <span className="text-gradient block mt-2">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative border-0 shadow-card hover:shadow-lg transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-accent scale-[1.02]' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge 
                    className={`px-3 py-1 ${
                      plan.popular 
                        ? 'gradient-emerald text-accent-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {plan.badge === "Best Value" && <Sparkles className="w-3 h-3 mr-1" />}
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                  {plan.popular && <Zap className="w-5 h-5 text-accent" />}
                </div>
                <p className="text-sm text-muted-foreground font-arabic">{plan.nameAr}</p>
                
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="line-through">${plan.originalPrice}</span>
                      <span className="text-accent ml-2">You save ${Number(plan.originalPrice) - Number(plan.price)}</span>
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.variant as "link" | "outline" | "secondary" | "ghost" | "default" | "destructive" | null | undefined}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include SSL encryption, automatic backups, and 99.9% uptime guarantee.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
