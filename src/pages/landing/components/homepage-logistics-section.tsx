import { Link } from "react-router-dom";
import {
  FileText,
  Warehouse,
  GitBranch,
  Globe,
  Truck,
  Package,
} from "lucide-react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const SERVICES = [
  {
    icon: FileText,
    title: "Customs Brokerage",
    desc: "Navigating customs with ease, ensuring your goods clear borders swiftly and compliantly.",
    highlighted: false,
  },
  {
    icon: Warehouse,
    title: "Warehousing & Distribution",
    desc: "Secure storage and efficient distribution solutions to keep your inventory flowing smoothly.",
    highlighted: true,
  },
  {
    icon: GitBranch,
    title: "Supply Chain Management",
    desc: "Optimizing every step of your supply chain for streamlined, efficient and cost-effective operations.",
    highlighted: false,
  },
  {
    icon: Globe,
    title: "Cross-Border Solutions",
    desc: "Seamless cross-border logistics to connect your business with international markets.",
    highlighted: false,
  },
  {
    icon: Truck,
    title: "Last-Mile Delivery",
    desc: "Reliable last-mile delivery that gets your products to customers' doorsteps with precision.",
    highlighted: false,
  },
  {
    icon: Package,
    title: "Project Cargo Handling",
    desc: "Specialized handling for oversized or complex shipments, with tailored logistics solutions.",
    highlighted: false,
  },
];

export default function HomepageLogisticsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
              OUR LOGISTIC SERVICES
            </span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className="mx-auto mt-5 max-w-3xl text-center font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Comprehensive{" "}
            <span className="text-landing-red">OMNIQ Services</span> Tailored to
            Meet Your Unique{" "}
            <span className="text-landing-red">Needs</span>
          </h2>
        </FadeIn>

        <div className="mt-12 space-y-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <FadeIn key={service.title} delay={0.08 * i}>
                <div
                  className={`group flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                    service.highlighted
                      ? "border-landing-navy bg-landing-navy text-white"
                      : "border-landing-border bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        service.highlighted
                          ? "bg-white/10 text-white"
                          : "bg-landing-red/10 text-landing-red"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">{service.title}</h3>
                  </div>

                  <p
                    className={`max-w-md text-sm leading-relaxed ${
                      service.highlighted ? "text-white/70" : "text-landing-muted"
                    }`}
                  >
                    {service.desc}
                  </p>

                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  >
                    <Link
                      to="/services"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                        service.highlighted
                          ? "bg-white text-landing-navy hover:bg-white/90"
                          : "bg-landing-navy text-white hover:bg-landing-navy-light"
                      }`}
                      aria-label={`Learn more about ${service.title}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
