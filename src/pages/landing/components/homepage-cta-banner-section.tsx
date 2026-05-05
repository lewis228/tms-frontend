import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

export default function HomepageCtaBannerSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/33275774/pexels-photo-33275774.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop"
          alt="Aerial view of winding road through green landscape" // TODO: replace asset
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-landing-navy/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <FadeIn>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                We&rsquo;re revolutionizing logistics to meet a growing market
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
                Transforming logistics with innovative solutions, by using
                advanced technologies and data-driven strategies to improve
                efficiency, reduce costs, and meet the growing demands of the
                market.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            >
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Learn more
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
