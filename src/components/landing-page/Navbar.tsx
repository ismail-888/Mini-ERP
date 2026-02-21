'use client';
import { useState } from "react";
import { MarketingButton } from "./MarketingButton";
import { Menu, X } from "lucide-react";
import { Link } from "~/i18n/routing"; // استيراد الـ Link الذكي الخاص بمشروعك
import type { User } from "next-auth";

interface NavbarProps {
  user?: User;
}

const Navbar = ({ user }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features", labelAr: "المميزات" },
    { href: "#pricing", label: "Pricing", labelAr: "الأسعار" },
    { href: "#contact", label: "Contact", labelAr: "تواصل" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - نستخدم Link أيضاً للعودة للرئيسية */}
          <Link href="/" className="flex items-center gap-2">
            {/* <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center shadow-soft">
              <span className="text-accent-foreground font-bold text-lg">م</span>
            </div> */}
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground leading-tight">Mousaheb</span>
              <span className="text-xs text-muted-foreground font-arabic">موصاحب</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons - الأزرار الآن تعمل */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <MarketingButton variant="emerald" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </MarketingButton>
            ) : (
              <>
                <MarketingButton variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </MarketingButton>
                
                <MarketingButton variant="emerald" size="sm" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </MarketingButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {/* روابط الموبايل */}
                {user ? (
                  <MarketingButton variant="emerald" className="w-full justify-center" asChild>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  </MarketingButton>
                ) : (
                  <>
                    <MarketingButton variant="ghost" className="w-full justify-center" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    </MarketingButton>
                    
                    <MarketingButton variant="emerald" className="w-full justify-center" asChild>
                      <Link href="/register" onClick={() => setIsOpen(false)}>Start Free Trial</Link>
                    </MarketingButton>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;