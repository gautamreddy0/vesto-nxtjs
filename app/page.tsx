import { FeatureCards } from "@/components/landing/feature-cards";
import { LandingFooter } from "@/components/landing/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/hero";
import { LandingNavbar } from "@/components/landing/navbar";
import { MarketSnapshot } from "@/components/landing/market-snapshot";
import { WhySection } from "@/components/landing/why-section";
import { CtaBand } from "@/components/landing/cta-band";

export const metadata = {
  description: "Vesto is an AI-powered investment learning platform: master the fundamentals, analyze real companies, pitch to an AI Fund Manager and invest a $10,000 virtual portfolio.",
};

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <LandingHero />
      <div className="mx-auto max-w-[1240px] space-y-8 px-6 pb-10">
        <FeatureCards />
      </div>
      <HowItWorks />
      <div className="mx-auto max-w-[1240px] space-y-8 px-6 pb-10">
        <MarketSnapshot />
        <WhySection />
        <CtaBand />
      </div>
      <LandingFooter />
    </>
  );
}
