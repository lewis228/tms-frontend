import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

export default function AboutCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-landing-navy">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
              <img
                src="https://images.pexels.com/photos/31244440/pexels-photo-31244440.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&fit=crop"
                alt="Container port with cranes" // TODO: replace asset
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:p-12">
              <FadeIn>
                <h2 className="font-heading text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                  Let Our Team Handle your Cargo with Care
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
                  Our experienced team ensures your cargo is handled with the
                  utmost care, providing safe and timely delivery every step of
                  the way.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <motion.div
                  className="mt-6"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                >
                  <Link
                    to="/sign-up"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Get a Quote
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
