import { Button } from "~/components/ui/button";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

const HeroSection = () => {
  const features = [
    "7-Day Free Trial",
    "No Credit Card Required",
    "Full Access to All Features",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
            <span className="text-sm text-primary-foreground/90">Now Available in Lebanon</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-4 animate-slide-up leading-tight">
            Manage Your Business
            <br />
            <span className="text-gradient">The Smart Way</span>
          </h1>

          {/* Arabic Tagline */}
          <p className="text-2xl md:text-3xl font-arabic text-primary-foreground/80 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            موصاحب - شريكك في النجاح
          </p>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            The complete Mini-ERP & POS solution designed for Lebanese businesses. 
            Handle dual-currency transactions, inventory, and more — all in one place.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="default" size="lg" className="w-full sm:w-auto">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-12 border-t border-primary-foreground/10 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-primary-foreground/50 mb-4">Trusted by businesses across Lebanon</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-primary-foreground/70 font-semibold">500+ Active Users</div>
              <div className="w-px h-6 bg-primary-foreground/20 hidden sm:block" />
              <div className="text-primary-foreground/70 font-semibold">USD & LBP Support</div>
              <div className="w-px h-6 bg-primary-foreground/20 hidden sm:block" />
              <div className="text-primary-foreground/70 font-semibold">24/7 Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
