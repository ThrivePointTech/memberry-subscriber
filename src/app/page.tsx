import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import LogoStrip from "@/components/LogoStrip";
import HowSection from "@/components/HowSection";
// import MathSection from "@/components/MathSection";
import WhySection from "@/components/WhySection";
import KitSection from "@/components/KitSection";
import DealSection from "@/components/DealSection";
import ReframeSection from "@/components/ReframeSection";
import FaqSection from "@/components/FaqSection";
import TeamSection from "@/components/TeamSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <NavBar />
      <HeroSection />
      {/* <LogoStrip /> */}
      <HowSection />
      {/* <MathSection /> */}
      <WhySection />
      <KitSection />       {/* MerchantApp */}
      <DealSection />      {/* Pricing */}
      <ReframeSection />   {/* MemberAppShowcase */}
      <FaqSection />
      <TeamSection />
      <CtaSection />       {/* Contact */}
      <Footer />
    </>
  );
}
