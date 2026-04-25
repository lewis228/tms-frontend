import HeroSection from "./components/hero-section";
import LogosSection from "./components/logos-section";
import IntegrateSection from "./components/integrate-section";
import DxSection from "./components/dx-section";
import DeliverabilitySection from "./components/deliverability-section";
import TestimonialQuoteSection from "./components/testimonial-quote-section";
import DashboardSection from "./components/dashboard-section";
import TestimonialsSection from "./components/testimonials-section";
import CtaSection from "./components/cta-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <LogosSection />
      <IntegrateSection />
      <DxSection />
      <DeliverabilitySection />
      <TestimonialQuoteSection />
      <DashboardSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
