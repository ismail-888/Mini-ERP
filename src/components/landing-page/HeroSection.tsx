'use client';

import { MarketingButton } from "./MarketingButton";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Link } from "~/i18n/routing"; // استيراد Link الذكي
import { useState } from "react";

const HeroSection = () => {
  const [showVideo, setShowVideo] = useState(false);

  const features = [
    "7-Day Free Trial",
    "No Credit Card Required",
    "Full Access to All Features",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background & Floating Elements - تبقى كما هي */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-soft" />
            <span className="text-sm text-primary-foreground/90 font-medium tracking-wide">
              Now Available in Lebanon 🇱🇧
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-4 animate-slide-up leading-tight">
            Manage Your Business
            <br />
            <span className="text-gradient">The Smart Way</span>
          </h1>

          <p className="text-2xl md:text-3xl font-arabic text-primary-foreground/80 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            موصاحب - شريكك في النجاح
          </p>

          <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            The complete Mini-ERP & POS solution designed for Lebanese businesses. 
            Handle dual-currency transactions and inventory — all in one place.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground/90 text-sm border border-white/5"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTA Buttons - التحديث هنا */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {/* زر البدء موجه لصفحة التسجيل */}
            <MarketingButton variant="emerald" size="xl" className="w-full sm:w-auto group" asChild>
              <Link href="/register">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MarketingButton>

            {/* زر العرض التوضيحي */}
            <MarketingButton 
              variant="outline-light" 
              size="xl" 
              className="w-full sm:w-auto"
              onClick={() => setShowVideo(true)} // فتح الفيديو
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-white/10 mr-2">
                <Play className="w-4 h-4 fill-current" />
              </div>
              Watch Demo
            </MarketingButton>
          </div>

          {/* Trust Indicators - تبقى كما هي */}
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

      {/* Video Modal - إضافة بسيطة لإظهار الفيديو */}
      {/* {showVideo && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <button className="absolute top-4 right-4 text-white z-10 font-bold bg-black/50 p-2 rounded-full hover:bg-black">✕</button>
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1" 
              allow="autoplay; encrypted-media" 
              allowFullScreen
            />
          </div>
        </div>
      )} */}
    </section>
  );
};

export default HeroSection;