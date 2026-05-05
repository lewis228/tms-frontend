import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, Pause, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServiceBySlug } from "./service-detail-data";
import type { ServiceDetailData } from "./service-detail-data";

/* ─── Main page ─── */
export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;

  if (!service) return <Navigate to="/services" replace />;

  return (
    <>
      <HeroSection service={service} />
      <GallerySection service={service} />
      <OverviewSection service={service} />
      <FeaturesSection service={service} />
      <FaqSection service={service} />
      <CtaSection service={service} />
    </>
  );
}

type SectionProps = { service: ServiceDetailData };

/* ─── 1. Hero / Breadcrumb ─── */
function HeroSection({ service }: SectionProps) {
  return (
    <section className="pb-10 pt-28 md:pb-16 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
        <FadeIn>
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <Link
              to="/services"
              className="text-landing-muted transition-colors hover:text-landing-navy"
            >
              Services
            </Link>
            <span className="mx-2 text-landing-muted">/</span>
            <span className="font-medium text-landing-red">
              {service.title}
            </span>
          </nav>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h1 className="mx-auto max-w-4xl font-heading text-3xl font-bold text-landing-navy sm:text-4xl md:text-5xl lg:text-6xl">
            {service.title}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-landing-muted md:text-base">
            {service.subtitle}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── 2. Image Gallery ─── */
function GallerySection({ service }: SectionProps) {
  const { images, videoThumb } = service.gallery;

  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Top-left */}
          <FadeIn className="md:col-span-1">
            <div className="h-52 overflow-hidden rounded-2xl md:h-full">
              <img
                src={images[0]}
                alt="Service gallery"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </FadeIn>

          {/* Top-center */}
          <FadeIn delay={0.05} className="md:col-span-1">
            <div className="h-52 overflow-hidden rounded-2xl md:h-full">
              <img
                src={images[1]}
                alt="Service gallery"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </FadeIn>

          {/* Right side – tall video thumbnail spanning 2 rows */}
          <FadeIn delay={0.1} className="md:col-span-1 md:row-span-2">
            <div className="group relative h-64 overflow-hidden rounded-2xl md:h-full">
              <img
                src={videoThumb}
                alt="Service video"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Video controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
                  aria-label="Pause video"
                >
                  <Pause className="h-3.5 w-3.5" fill="currentColor" />
                </button>
                <span className="text-xs font-medium text-white">
                  03:05 / 05:10
                </span>
                {/* Progress bar */}
                <div className="flex-1">
                  <div className="h-1 overflow-hidden rounded-full bg-white/30">
                    <div className="h-full w-[60%] rounded-full bg-landing-red" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Bottom-left */}
          <FadeIn delay={0.15} className="md:col-span-1">
            <div className="h-52 overflow-hidden rounded-2xl md:h-full">
              <img
                src={images[2]}
                alt="Service gallery"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </FadeIn>

          {/* Bottom-center */}
          <FadeIn delay={0.2} className="hidden md:col-span-1 md:block">
            <div className="h-full overflow-hidden rounded-2xl">
              <img
                src={images[1]}
                alt="Service gallery"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Service Overview ─── */
function OverviewSection({ service }: SectionProps) {
  const { overview } = service;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Badge */}
        <FadeIn>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
              {overview.badge}
            </span>
          </div>
        </FadeIn>

        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left – heading + body text */}
          <div className="lg:col-span-3">
            <FadeIn delay={0.05}>
              <h2 className="font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {overview.headingParts.map((part, i) => (
                  <span
                    key={i}
                    className={
                      part.color === "red"
                        ? "italic text-landing-red"
                        : "text-landing-navy"
                    }
                  >
                    {part.text}{" "}
                  </span>
                ))}
              </h2>
            </FadeIn>

            <div className="mt-6 space-y-4">
              {overview.paragraphs.map((p, i) => (
                <FadeIn key={i} delay={0.1 + 0.05 * i}>
                  <p className="text-sm leading-relaxed text-landing-muted md:text-base">
                    {p}
                  </p>
                </FadeIn>
              ))}
            </div>

            {/* Highlight cards */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {overview.highlights.map((h, i) => (
                <FadeIn key={h.title} delay={0.2 + 0.05 * i}>
                  <div className="rounded-2xl border border-landing-border p-6">
                    <h3 className="font-heading text-xl font-bold text-landing-navy">
                      {h.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">
                      {h.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right – sidebar card */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.15}>
              <div className="rounded-2xl border border-landing-border bg-white p-5">
                {/* Image */}
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={overview.sidebarImage}
                    alt="Service overview"
                    className="h-48 w-full object-cover md:h-56"
                  />
                </div>

                {/* Caption */}
                <p className="mt-4 text-sm leading-relaxed text-landing-muted">
                  {overview.sidebarCaption}
                </p>

                {/* Step icons */}
                <div className="mt-5 flex items-center justify-center gap-0">
                  {overview.stepIcons.map((Icon, i) => (
                    <div key={i} className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-landing-red/5 text-landing-red">
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < overview.stepIcons.length - 1 && (
                        <div className="mx-1 h-px w-6 bg-landing-border md:w-8" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-landing-navy">
                    Benefits
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {overview.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-landing-muted" />
                        <span className="text-xs text-landing-muted">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <motion.div
                  className="mt-6"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <Link
                    to="/sign-up"
                    className="block w-full rounded-full bg-landing-navy py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-landing-navy-light"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Key Features ─── */
function FeaturesSection({ service }: SectionProps) {
  const { features } = service;

  return (
    <section className="bg-landing-light py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
              Key Features
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <h2 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
            {features.heading.split(" ").map((word, i, arr) => {
              // Color first and last words red for the italic pattern
              const isRed = i === 0 || i === arr.length - 1;
              return (
                <span
                  key={i}
                  className={isRed ? "italic text-landing-red" : ""}
                >
                  {word}{" "}
                </span>
              );
            })}
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-landing-muted md:text-base">
            {features.subtitle}
          </p>
        </FadeIn>

        {/* Feature cards */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <FadeIn key={card.title} delay={0.08 * i}>
                <div className="flex h-full flex-col items-start rounded-2xl border border-landing-border bg-white p-6 text-left transition-shadow hover:shadow-lg md:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-landing-red/5 text-landing-red">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-landing-navy">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-landing-muted">
                    {card.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. FAQ ─── */
function FaqSection({ service }: SectionProps) {
  const { faq } = service;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">
          {/* Left heading */}
          <div className="lg:col-span-2">
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  Frequently Ask Question
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
                Common{" "}
                <span className="italic text-landing-red">Questions</span>{" "}
                About Our Services
              </h2>
            </FadeIn>
          </div>

          {/* Right accordion */}
          <div className="lg:col-span-3">
            <FadeIn delay={0.1}>
              <Accordion
                defaultValue={[2]}
                className="w-full"
              >
                {faq.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-b border-landing-border"
                  >
                    <AccordionTrigger className="py-5 text-left font-heading text-base font-bold text-landing-navy hover:no-underline md:text-lg [&[data-state=open]>svg]:rotate-180">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-landing-muted">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. CTA Banner ─── */
function CtaSection({ service }: SectionProps) {
  const { cta } = service;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="px-5 pb-16 md:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-landing-navy">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <FadeIn>
            <div className="h-64 md:h-full">
              <img
                src={cta.image}
                alt="Service CTA"
                className="h-full w-full object-cover"
              />
            </div>
          </FadeIn>

          {/* Text */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <FadeIn delay={0.1}>
              <h2 className="font-heading text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                {cta.heading}
              </h2>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                {cta.description}
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <motion.div
                className="mt-6 inline-block"
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-landing-navy transition-shadow hover:shadow-lg hover:shadow-white/20"
                >
                  Contact Us
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-landing-navy text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
