import { Link } from "react-router-dom";
import {
  ArrowRight,
  Contact,
  Warehouse,
  Network,
  Globe,
  Truck,
  Container,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";
import type { LucideIcon } from "lucide-react";

type ServiceCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  slug: string;
  featured?: boolean;
};

const SERVICES: ServiceCard[] = [
  {
    icon: Contact,
    title: "Customs Brokerage",
    description:
      "Navigating customs with ease, ensuring your goods clear borders swiftly and compliantly.",
    slug: "customs-brokerage",
  },
  {
    icon: Warehouse,
    title: "Warehousing & Distribution",
    description:
      "Secure storage and efficient distribution solutions to keep your inventory flowing smoothly.",
    slug: "warehousing-distribution",
    featured: true,
  },
  {
    icon: Network,
    title: "Supply Chain Management",
    description:
      "Optimizing every step of your supply chain for streamlined, efficient and cost-effective operations.",
    slug: "supply-chain-management",
  },
  {
    icon: Globe,
    title: "Cross-Border Solutions",
    description:
      "Seamless cross-border logistics to connect your business with international markets.",
    slug: "cross-border-solutions",
  },
  {
    icon: Truck,
    title: "Last-Mile Delivery",
    description:
      "Reliable last-mile delivery that gets your products to customers' doorsteps with precision.",
    slug: "last-mile-delivery",
    featured: true,
  },
  {
    icon: Container,
    title: "Project Cargo Handling",
    description:
      "Specialized handling for oversized or complex shipments, with tailored logistics solutions.",
    slug: "project-cargo-handling",
  },
];

export default function ServicesGridSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                Logistic Services
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
              Comprehensive{" "}
              <span className="italic text-landing-red">OMNIQ Services</span>{" "}
              Tailored to Meet Your Unique{" "}
              <span className="italic text-landing-red">Needs</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-landing-muted md:text-base">
              Our vision is to be the leading logistics partner, known for
              excellence in supply chain management, innovation, and customer
              satisfaction, while exceeding expectations and driving success for
              our clients globally.
            </p>
          </FadeIn>
        </div>

        {/* Cards grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            const isFeatured = service.featured;

            return (
              <FadeIn key={service.title} delay={0.08 * i}>
                <div
                  className={`group flex h-full flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg md:p-8 ${
                    isFeatured
                      ? "border-transparent bg-landing-navy text-white"
                      : "border-landing-border bg-white text-landing-navy"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isFeatured
                        ? "bg-white/10 text-white"
                        : "bg-landing-red/5 text-landing-red"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 text-lg font-bold">{service.title}</h3>

                  {/* Description */}
                  <p
                    className={`mt-2 flex-1 text-sm leading-relaxed ${
                      isFeatured ? "text-white/70" : "text-landing-muted"
                    }`}
                  >
                    {service.description}
                  </p>

                  {/* CTA */}
                  <div className="mt-6">
                    <motion.div
                      className="inline-block"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    >
                      <Link
                        to={`/services/${service.slug}`}
                        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                          isFeatured
                            ? "border border-white/30 text-white hover:bg-white/10"
                            : "border border-landing-navy text-landing-navy hover:bg-landing-navy hover:text-white"
                        }`}
                      >
                        Get a Quote
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${
                            isFeatured
                              ? "bg-white text-landing-navy"
                              : "bg-landing-navy text-white"
                          }`}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
