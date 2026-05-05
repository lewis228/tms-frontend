import ServicesHeroSection from "./components/services-hero-section";
import ServicesCommunitySection from "./components/services-community-section";
import ServicesGridSection from "./components/services-grid-section";
import ServicesProcessSection from "./components/services-process-section";
import ServicesCtaSection from "./components/services-cta-section";

export default function ServicesPage() {
  return (
    <>
      <ServicesHeroSection />
      <ServicesCommunitySection />
      <ServicesGridSection />
      <ServicesProcessSection />
      <ServicesCtaSection />
    </>
  );
}
