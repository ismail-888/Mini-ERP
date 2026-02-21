import Navbar from "../../../components/landing-page/Navbar";
import HeroSection from "../../../components/landing-page/HeroSection";
import FeaturesSection from "../../../components/landing-page/FeaturesSection";
import PricingSection from "../../../components/landing-page/PricingSection";
import Footer from "../../../components/landing-page/Footer";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session?.user} />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
