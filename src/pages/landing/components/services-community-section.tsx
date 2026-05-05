import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

const STATS = [
  { value: "25", label: "Years of Industry Experience" },
  { value: "300+", label: "Employees for Your Success" },
  { value: "500+", label: "Satisfied Clients Worldwide" },
  { value: "99%", label: "On-Time Delivery Rate" },
];

export default function ServicesCommunitySection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — text */}
          <div>
            <FadeIn>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-landing-red" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-muted">
                  Our Community
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-landing-navy md:text-4xl lg:text-5xl">
                Join a{" "}
                <span className="italic text-landing-red">Growing Community</span>{" "}
                of Business and Logistics Partners
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-4 text-sm leading-relaxed text-landing-muted md:text-base">
                Join a dynamic community of businesses and logistics partners,
                optimizing supply chains and driving growth.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <motion.div
                className="mt-6 inline-block"
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-landing-border px-5 py-2.5 text-sm font-medium text-landing-navy transition-colors hover:border-landing-navy"
                >
                  Join Us
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-landing-border">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              </motion.div>
            </FadeIn>

            {/* Partner logos placeholders */}
            <FadeIn delay={0.4}>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                {["Logoipsum", "logo ipsum", "Logoipsum"].map((name, i) => (
                  <span
                    key={i}
                    className="text-sm font-medium text-landing-muted/40"
                  >
                    ◎ {name}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right column — stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={0.1 * i}>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-landing-border bg-white p-6 text-center md:p-8">
                  <span className="font-heading text-4xl font-bold text-landing-navy md:text-5xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 text-sm text-landing-muted">
                    {stat.label}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
