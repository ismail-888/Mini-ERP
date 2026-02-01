import Navbar from "../../../components/landing-page/Navbar";
import HeroSection from "../../../components/landing-page/HeroSection";
import FeaturesSection from "../../../components/landing-page/FeaturesSection";
import PricingSection from "../../../components/landing-page/PricingSection";
import Footer from "../../../components/landing-page/Footer";

export default async function Home() {


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
