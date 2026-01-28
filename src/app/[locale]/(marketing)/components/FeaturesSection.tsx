import { 
    Package, 
    ScanBarcode, 
    AlertTriangle, 
    CreditCard, 
    DollarSign,
    Receipt,
    BarChart3,
    Users,
    Shield
  } from "lucide-react";
  import { Card, CardContent } from "~/components/ui/card";
  import { Badge } from "~/components/ui/badge";
  
  const FeaturesSection = () => {
    const mainFeatures = [
      {
        icon: Package,
        title: "Inventory Management",
        titleAr: "إدارة المخزون",
        description: "Track stock levels, manage products, and get real-time inventory updates across all locations.",
        highlights: ["Barcode Scanning", "Low Stock Alerts", "Multi-location Support"],
        preview: <InventoryPreview />,
      },
      {
        icon: CreditCard,
        title: "Dual-Currency POS",
        titleAr: "نقطة بيع متعددة العملات",
        description: "Process sales seamlessly in both USD and LBP with automatic rate conversion and flexible payment options.",
        highlights: ["USD & LBP Display", "Auto Rate Sync", "Split Payments"],
        preview: <POSPreview />,
      },
    ];
  
    const additionalFeatures = [
      {
        icon: BarChart3,
        title: "Analytics & Reports",
        description: "Comprehensive insights into your business performance",
      },
      {
        icon: Users,
        title: "Customer Management",
        description: "Build customer relationships with CRM features",
      },
      {
        icon: Receipt,
        title: "Invoice Generation",
        description: "Professional invoices with multi-currency support",
      },
      {
        icon: Shield,
        title: "Data Security",
        description: "Enterprise-grade security for your business data",
      },
    ];
  
    return (
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1 border-accent text-accent">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need to
              <span className="text-gradient block mt-2">Run Your Business</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for Lebanese businesses, 
              with features that understand your unique needs.
            </p>
          </div>
  
          {/* Main Features */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {mainFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border-0 shadow-card hover:shadow-lg transition-all duration-300 group"
              >
                <CardContent className="p-0">
                  <div className="p-6 lg:p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-emerald flex items-center justify-center shrink-0 shadow-soft group-hover:shadow-glow transition-shadow">
                        <feature.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground font-arabic">{feature.titleAr}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.highlights.map((highlight, i) => (
                        <Badge key={i} variant="secondary" className="font-medium">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Feature Preview */}
                  <div className="border-t border-border bg-muted/30 p-6">
                    {feature.preview}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
  
          {/* Additional Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="border border-border/50 shadow-soft hover:shadow-card hover:border-accent/30 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  // Inventory Preview Component
  const InventoryPreview = () => {
    const items = [
      { name: "Coffee Beans", sku: "COF-001", stock: 45, status: "ok" },
      { name: "Sugar 1kg", sku: "SUG-002", stock: 8, status: "low" },
      { name: "Milk 1L", sku: "MLK-003", stock: 120, status: "ok" },
    ];
  
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <ScanBarcode className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-foreground">Scan to add products</span>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
            >
              <div>
                <p className="font-medium text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.stock}</span>
                {item.status === "low" && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Low</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // POS Preview Component
  const POSPreview = () => {
    const rate = 89500;
    const priceUSD = 25.00;
    const priceLBP = priceUSD * rate;
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <div className="flex items-baseline gap-3 mt-1">
              <div className="flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold text-foreground">{priceUSD.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-lg font-semibold text-muted-foreground">
                {priceLBP.toLocaleString()} LBP
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Exchange Rate</p>
            <p className="text-sm font-medium text-foreground">1 USD = {rate.toLocaleString()} LBP</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 rounded-lg bg-accent/10 text-accent font-medium text-sm hover:bg-accent/20 transition-colors">
            Pay USD
          </button>
          <button className="p-3 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors">
            Pay LBP
          </button>
        </div>
      </div>
    );
  };
  
  export default FeaturesSection;
  