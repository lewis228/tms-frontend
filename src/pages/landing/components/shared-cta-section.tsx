import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import FadeIn from "@/pages/landing/components/fade-in";

export default function SharedCtaSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section>
      {/* Truck illustration area */}
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <FadeIn>
          <div className="relative flex items-center justify-center">
            <img
              src="https://images.pexels.com/photos/31049388/pexels-photo-31049388.jpeg?auto=compress&cs=tinysrgb&w=900&h=400&fit=crop"
              alt="White delivery truck" // TODO: replace asset
              className="mx-auto max-h-[280px] w-auto rounded-xl object-contain"
            />
          </div>
        </FadeIn>
        {/* Red line accent */}
        <div className="mx-auto mt-4 h-0.5 max-w-2xl bg-gradient-to-r from-transparent via-landing-red to-transparent" />
      </div>

      {/* CTA Banner */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3278012/pexels-photo-3278012.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop"
            alt="Aerial view of container ship" // TODO: replace asset
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-landing-navy/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:py-24 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <FadeIn>
                <h2 className="font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                  Streamline Your Logistics Today!
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
                  Discover a world of effortless and seamless logistics, ready to
                  transform the way you move forward.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={0.2}>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-landing-navy transition-shadow hover:shadow-lg hover:shadow-white/20"
                >
                  Get a Quote
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
