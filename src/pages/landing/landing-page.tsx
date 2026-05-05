import HomepageHeroSection from "./components/homepage-hero-section";
import HomepageServiceSection from "./components/homepage-service-section";
import HomepageFreightSection from "./components/homepage-freight-section";
import HomepageValuesSection from "./components/homepage-values-section";
import HomepageCtaBannerSection from "./components/homepage-cta-banner-section";
import HomepageProcessSection from "./components/homepage-process-section";
import HomepageLogisticsSection from "./components/homepage-logistics-section";
import HomepageTestimonialsSection from "./components/homepage-testimonials-section";
import HomepagePricingSection from "./components/homepage-pricing-section";
import HomepageArticlesSection from "./components/homepage-articles-section";
import SharedCtaSection from "./components/shared-cta-section";

export default function LandingPage() {
  return (
    <>
      <HomepageHeroSection />
      <HomepageServiceSection />
      <HomepageFreightSection />
      <HomepageValuesSection />
      <HomepageCtaBannerSection />
      <HomepageProcessSection />
      <HomepageLogisticsSection />
      <HomepageTestimonialsSection />
      <HomepagePricingSection />
      <HomepageArticlesSection />
      <SharedCtaSection />
    </>
  );
}
