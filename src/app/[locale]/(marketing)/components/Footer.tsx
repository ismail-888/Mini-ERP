import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Demo", href: "#" },
      { label: "Changelog", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#contact" },
      { label: "API Docs", href: "#" },
      { label: "Status", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  };

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-emerald flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">م</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-primary-foreground leading-tight">Mousaheb</span>
                <span className="text-xs text-primary-foreground/70 font-arabic">موصاحب</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-sm">
              Empowering Lebanese businesses with modern ERP & POS solutions. 
              Your trusted partner for growth.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="w-5 h-5" />
                <span>support@mousaheb.com</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="w-5 h-5" />
                <span>+961 1 234 567</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/70">
                <MapPin className="w-5 h-5" />
                <span>Beirut, Lebanon</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {links.support.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © {currentYear} Mousaheb. All rights reserved.
            </p>
            <p className="text-primary-foreground/60 text-sm font-arabic">
              صُنع بحب في لبنان 🇱🇧
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
